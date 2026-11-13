import { useEffect, useState } from "react";
import { Button, DateView, Icon, Input } from "nystem-components";
import GitFileViewer from "./fileViewer";

const formatSize = (size) => {
  const units = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${Number(size.toFixed(2))} ${units[unit]}`;
};

const FolderSize = ({ request, path, name }) => {
  const [result, setResult] = useState({});

  return (
    <span className="inline-flex items-center gap-2">
      {result.size !== undefined && formatSize(result.size)}
      <button
        type="button"
        disabled={result.loading}
        className="rounded p-1 hover:bg-gray-600"
        aria-label={`Calculate size of ${name}`}
        title="Calculate folder contents size"
        onClick={async () => {
          setResult({ size: result.size, loading: true });
          try {
            const { size } = await request({ action: "folderSize", path });
            setResult({ size });
          } catch (error) {
            setResult({ size: result.size, error: error.message });
          }
        }}
      >
        <Icon
          title={false}
          aria-hidden="true"
          icon={result.loading ? "rotate" : "calculator"}
          className={["size-4", result.loading && "animate-spin"]}
        />
      </button>
      {result.error && (
        <span role="alert" className="text-red-300">
          {result.error}
        </span>
      )}
    </span>
  );
};

const GitFileBrowser = ({ request, fileViewer }) => {
  const [path, setPath] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [listing, setListing] = useState(null);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState("");
  const [viewerBusy, setViewerBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    fileViewer.current = { dirty, busy: viewerBusy };
    return () => {
      fileViewer.current = { dirty: false, busy: false };
    };
  }, [dirty, viewerBusy, fileViewer]);
  const parts = path ? path.split("/") : [];

  useEffect(() => {
    let active = true;
    setListing(null);
    request({ action: "browseFiles", path }).then(
      ({ items }) => active && setListing({ items }),
      (error) => active && setListing({ error: error.message }),
    );
    return () => {
      active = false;
    };
  }, [path, refresh, request]);

  const navigate = (path) => {
    setPath(path);
    setFilter("");
  };
  const items = listing?.items?.filter(({ name }) => name.toLowerCase().includes(filter.toLowerCase().trim()));

  return (
    <section aria-label="Project files" className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-700 bg-blue-900/70 px-3 py-2">
        <Button
          size="xs"
          disabled={!path}
          title="Parent folder"
          aria-label="Parent folder"
          onClick={() => navigate(parts.slice(0, -1).join("/"))}
        >
          <Icon title={false} aria-hidden="true" icon="arrow-up" className="size-4" />
        </Button>
        <Button size="xs" disabled={!path} title="Project root" aria-label="Project root" onClick={() => navigate("")}>
          <Icon title={false} aria-hidden="true" icon="house" className="size-4" />
        </Button>
        <Button size="xs" title="Refresh folder" aria-label="Refresh folder" onClick={() => setRefresh(refresh + 1)}>
          <Icon title={false} aria-hidden="true" icon="rotate" className="size-4" />
        </Button>
        <nav aria-label="Current folder" className="flex flex-1 flex-wrap items-center gap-1 break-all text-sm">
          <button type="button" className="hover:underline" onClick={() => navigate("")}>
            Project
          </button>
          {parts.map((name, index) => (
            <button
              key={index}
              type="button"
              className="hover:underline"
              onClick={() => navigate(parts.slice(0, index + 1).join("/"))}
            >
              / {name}
            </button>
          ))}
        </nav>
        <Input
          value={filter}
          onChange={setFilter}
          placeholder="Filter files…"
          aria-label="Filter files"
          className="w-36 bg-gray-900"
        />
        {items && <span className="text-xs text-gray-400">{items.length} items</span>}
      </div>
      <div className={file ? "grid min-h-0 flex-1 grid-cols-2" : "flex min-h-0 flex-1"}>
        <div className="min-h-0 min-w-0 flex-1 overflow-auto">
          {listing?.error ? (
            <p role="alert" className="p-3 text-red-300">
              {listing.error}
            </p>
          ) : !listing ? (
            <p role="status" className="p-3 text-gray-400">
              Loading folder…
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-900 text-xs text-gray-400">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2 text-right">Size</th>
                  <th className="px-3 py-2">Modified</th>
                </tr>
              </thead>
              <tbody>
                {items.map(({ name, directory, file: regularFile, size, modified }) => {
                  const entry = path ? `${path}/${name}` : name;
                  return (
                    <tr key={name} className={file === entry ? "bg-blue-900" : "even:bg-gray-800/60 hover:bg-gray-700"}>
                      <td className="w-full break-all px-3 py-1">
                        <button
                          type="button"
                          disabled={!directory && !regularFile}
                          className="flex w-full items-center gap-2 py-1 text-left disabled:text-gray-400"
                          onClick={() => {
                            if (directory) navigate(entry);
                            else if (
                              file !== entry &&
                              !viewerBusy &&
                              (!dirty || window.confirm("Discard unsaved changes?"))
                            ) {
                              setDirty(false);
                              setFile(entry);
                            }
                          }}
                        >
                          <Icon
                            title={false}
                            aria-hidden="true"
                            icon="chevron-right"
                            className={["size-3", "shrink-0", !directory && "invisible"]}
                          />
                          <Icon
                            title={false}
                            aria-hidden="true"
                            icon={directory ? "folder" : "file"}
                            className={["size-4", "shrink-0", directory && "text-sky-400"]}
                          />
                          {name}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 text-right tabular-nums text-gray-400">
                        {directory ? (
                          <FolderSize key={entry} request={request} path={entry} name={name} />
                        ) : (
                          regularFile && formatSize(size)
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 text-gray-400">
                        <DateView value={modified} model={{ renderAs: "span", dateFormat: "dateTimeLong" }} />
                      </td>
                    </tr>
                  );
                })}
                {!items.length && (
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-gray-400">
                      {filter ? "No matching files" : "Empty folder"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {file && (
          <GitFileViewer
            key={file}
            file={file}
            request={request}
            close={() => {
              setFile("");
              setDirty(false);
            }}
            changed={() => setRefresh((refresh) => refresh + 1)}
            setViewerBusy={setViewerBusy}
            setDirty={setDirty}
          />
        )}
      </div>
    </section>
  );
};

export default GitFileBrowser;
