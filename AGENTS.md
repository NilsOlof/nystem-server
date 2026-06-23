# Agent Notes

## Working Guidelines

- Follow the existing app object and event-driven structure.
- Use hooks for whenever practical.
- Avoid edits in `core/` unless needed.
- Browser-facing source code in `component/` and `client/` in each module, client also contains code that runs in both.
- Never touch generated/copied files in `web/` directly.
- The dev client process watches `core/` and `module/` continuously and copies/generated browser files into `web/src` while it runs; make source changes in `core/`, `module/`, or source templates such as `core/file/`, then let the generator update `web/`.
- Dont write functions that are only used once.
- Allways respond in english and use the english language if not explicit stated otherwise.
- Never change in `data/` without confirmation before.
