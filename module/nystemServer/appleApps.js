import { X509Certificate } from "node:crypto";
import { globSync } from "node:fs";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

export const findAppleProject = (basepath) => {
  const iosPath = join(basepath, "module/native-app/ios");
  const projects = globSync("*.xcodeproj/project.pbxproj", { cwd: iosPath });
  if (projects.length === 1) return join(iosPath, dirname(projects[0]));
};

const getDevelopmentTeam = async (runFile) => {
  if (process.env.DEVELOPMENT_TEAM) return process.env.DEVELOPMENT_TEAM;

  const { stdout: identities } = await runFile("security", ["find-identity", "-v", "-p", "codesigning"]);
  const fingerprints = new Set(
    Array.from(identities.matchAll(/\b([\dA-F]{40}) "Apple Development:/g), ([, fingerprint]) => fingerprint),
  );
  if (!fingerprints.size) throw new Error("No valid Apple Development signing identity was found in the Mac keychain");

  const { stdout: certificates } = await runFile("security", [
    "find-certificate",
    "-a",
    "-c",
    "Apple Development",
    "-p",
  ]);
  const teams = new Set();
  for (const pem of certificates.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) || []) {
    const certificate = new X509Certificate(pem);
    if (fingerprints.has(certificate.fingerprint.replaceAll(":", "")))
      teams.add(certificate.toLegacyObject().subject.OU);
  }
  const [team] = teams;
  if (teams.size !== 1 || !team)
    throw new Error("Set DEVELOPMENT_TEAM for Nystem Server to select the Apple Development signing team");
  return team;
};

const getDevice = (devices, platform, name) => {
  const matches = devices.filter((device) => {
    const hardware = device.properties?.hardware || device.hardwareProperties;
    return hardware?.reality === "physical" && hardware.platform === platform;
  });
  if (!matches.length) throw new Error(`Connect a paired ${name} to install the app`);
  if (matches.length > 1) throw new Error(`Make only one ${name} available to Xcode before installing`);
  return matches[0].identifier;
};

export const installAppleApps = async (app, id, role, runFile, run, publish) => {
  await publish("Preparing Apple app installation…\n");
  const { data: server } = await app.database.server.get({ id, role });
  if (!server) throw new Error("Server was not found");
  const { basepath } = await app.event("serverPath", server);
  const project = findAppleProject(basepath);
  if (!project) throw new Error("No Apple app project was found");

  const { stdout: branch } = await runFile("git", ["branch", "--show-current"], { cwd: basepath });
  if (branch.trim() !== "develop") throw new Error("Apple app installation requires the develop branch");

  const { stdout } = await runFile("xcrun", [
    "devicectl",
    "list",
    "devices",
    "--filter",
    "State BEGINSWITH 'available' OR State = 'connected'",
    "--timeout",
    "15",
    "--json-output",
    "-",
  ]);
  const { devices } = JSON.parse(stdout).result;
  const iPhone = getDevice(devices, "iOS", "iPhone");
  const team = await getDevelopmentTeam(runFile);
  const scheme = basename(project, ".xcodeproj");
  const temp = join(app.__dirname, "files/temp");
  await mkdir(temp, { recursive: true });
  const derivedData = await mkdtemp(join(temp, "apple-apps-"));
  const products = join(derivedData, "Build/Products");
  try {
    await publish(`Building ${scheme}…\n`);
    await run(
      "xcodebuild",
      [
        "-project",
        project,
        "-scheme",
        scheme,
        "-configuration",
        "Debug",
        "-destination",
        "generic/platform=iOS",
        "-derivedDataPath",
        derivedData,
        "-allowProvisioningUpdates",
        "-quiet",
        `SYMROOT=${products}`,
        `DEVELOPMENT_TEAM=${team}`,
        "build",
      ],
      basepath,
    );

    const iosApp = join(products, "Debug-iphoneos", `${scheme}.app`);
    if (!app.fs.existsSync(join(iosApp, "Info.plist"))) throw new Error(`No built iOS app was found for ${scheme}`);
    const watchApps = globSync("Watch/*.app", { cwd: iosApp });
    const watch = watchApps.length ? getDevice(devices, "watchOS", "Apple Watch") : undefined;

    await publish("Installing on iPhone…\n");
    await run(
      "xcrun",
      ["devicectl", "device", "install", "app", "--device", iPhone, iosApp, "--timeout", "120"],
      basepath,
    );
    for (const watchApp of watchApps) {
      await publish("Installing on Apple Watch…\n");
      await run(
        "xcrun",
        ["devicectl", "device", "install", "app", "--device", watch, join(iosApp, watchApp), "--timeout", "120"],
        basepath,
      );
    }
  } finally {
    await rm(derivedData, { recursive: true, force: true });
  }
};
