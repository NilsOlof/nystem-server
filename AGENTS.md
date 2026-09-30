## Working Guidelines

### Architecture and implementation

- Follow the existing app object and event-driven structure.
- Use hooks whenever practical.
- Prefer fixes in the owning module. Edit `core/` only when the issue is genuinely shared or cannot be correctly solved at the module level, and explain why the core change is necessary.
- Browser-facing source code lives in each module's `component/` and `client/` directories. Code in `client/` may also run outside the browser.
- Content types live in `contentType/` directories under `core/` and `module/`. Each content type is a JSON definition with metadata. The top-level `item` array defines the content type's fields/schema. The `views` array defines named UI views, and each view's `item` array is a component tree composed of content type fields and view/layout components.
- Use the existing `Inserter` component for routing and render insertion. Do not add a separate routing system. The UI starts from the `Index` component.
- Before using a lower-level API, check whether the system already provides a contextual API for the same operation. Always use the contextual API when available.
- Prefer platform content type components and existing component formats. Compose existing platform components in the content type definition instead of adding custom React components, component hacks, or usage-specific logic. For example, wrap content with the existing `session` component using `format: "role"` instead of adding role handling to the tabs component. Create a custom component only when the required behavior cannot be expressed through the platform.
- Use Tailwind CSS for styling unless there is a good reason not to.
- Always use the shared `dateView` (`date` with `format: "view"`) to display dates. Do not format dates directly with `toLocaleString` or custom date formatting in UI components.

### Code quality and data flow

- Diagnose the actual cause before changing code. Do not replace an implementation with a functionally equivalent implementation and present it as a fix.
- Do not create functions or variables that are used only once. Inline an expression at its use site unless naming it has a functional purpose.
- Keep small, closely related helpers in the owning module instead of creating separate files without a clear independent responsibility.
- Keep the same name for the same value throughout the system. Do not rename it when passing, destructuring, or returning it.
- Keep field IDs aligned with their labels and referenced content types. Avoid alternate names such as `modelConfig` for an `aimodel` field.
- Preserve schema field IDs throughout processing. Pass unchanged fields through generically instead of repeating or translating every property name; name fields explicitly only when their values require distinct application behavior.
- Combine conditions that produce the same outcome into a single condition. Do not write consecutive or separate branches with identical bodies or return values.
- Do not add speculative or unnecessary checks. Add validation only for inputs that can actually occur through current callers or documented external boundaries, and keep conditions as simple as those guarantees allow.
- Store only data the application needs. Prefer references to source records over copied metadata, and do not add raw provider responses, schema versions, or debugging fields unless requested.
- Load referenced records and runtime configuration only when the operation needs them. Do not publish server configuration to the client when platform content types can load the data directly.
- Follow the actual dependency order of operations. Do not start work in parallel when an earlier result determines whether that work is needed; avoid unnecessary requests and computation.
- Never run database searches in parallel. Await each search sequentially; do not batch search calls with `Promise.all` or equivalent concurrency mechanisms.
- Do not add legacy cleanup, migration, or deletion code unless explicitly requested.

### Files and generated output

- Never edit generated or copied files in `web/` directly. The development client watches `core/` and `module/` and generates browser files in `web/src`; make source changes in `core/`, `module/`, or source templates such as `core/file/`, then let the generator update `web/`.
- Work through the workspace path supplied for the task, even when it is a symlink. Use that path for commands, edits, and user-facing file links because it integrates correctly with the editor. Resolve the original repository path only when Git or filesystem identity specifically requires it; do not expose the resolved path in the handoff unless necessary.
- Respect the project's Prettier configuration (`.prettierrc.json`) and `.prettierignore`. Format changed files with the project settings; do not introduce conflicting formatting or reformat unrelated files.
- Keep the repository root free of temporary files and generated working artifacts. Put scratch files, intermediate output, extracted previews, transcripts, and similar disposable artifacts in `files/temp/`, remove them when no longer needed, and do not use that directory for source files or version-controlled deliverables.
- Never leave task-created junk behind. Before finishing, remove temporary files, unused drafts, redundant copies, and empty directories created by the task. When a template or other artifact has been saved in its intended system, remove any local staging copy unless the application uses it or the user explicitly asks to keep it. Limit cleanup to artifacts from the current task; do not remove unrelated user files.
- Edit watched content type JSON through a temporary file in `files/temp/`, then replace the target atomically so the running compiler cannot read a partial document.
- Never change files in `data/` without prior confirmation.

### Verification and project operations

- Verify the complete user interaction in the running platform, including the resulting save and redirect, before reporting that it works.
- Use the running platform for visual verification. Do not create rendered previews or screenshots in `files/temp/` unless the user explicitly requests files.
- To start the site, read `data/host.json` and open `http://<client.domain>` in the in-app browser.
- Always show the in-app browser in the right pane while using it; do not keep it hidden. Leave the browser tab open after completing the task.
- The debug login code appears in the server log.
- Sign in as a super user at `/superadmin`.
- Do not restart the project server for design-only changes.
- Restart the project server when needed for non-design changes without asking for additional confirmation. Use the `nystem-server-control` skill for restarts. Other actions that clear user sessions still require an explicit request.

### User authorization

- Do not create or run data migrations unless the user explicitly asks for a migration.
- Do not create, modify, or run tests unless the user explicitly asks for tests.
- Never create Git commits unless the user explicitly asks to commit.
- Never run deployment scripts or commands unless the user explicitly asks to deploy.

### Communication

- Always respond in English unless the user explicitly requests another language.
