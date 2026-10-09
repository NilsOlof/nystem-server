import React, { useContext } from "react";
import { Button, ContentTypeRender, Input, Wrapper, Icon } from "nystem-components";
import { GitContext } from "../../client/context";
const GitToolbar = ({ model, path }) => {
  const { search, setSearch, busy, edit, error, branch, branches, switchBranch, openHistory, historyOpen } =
    useContext(GitContext);
  return (
    <Wrapper className={model.className}>
      <ContentTypeRender path={path} items={model.item || []} />
      <div className="flex items-center gap-1" role="group" aria-label="Git branches">
        {["master", "develop", ...(branches.includes("stage") ? ["stage"] : [])].map((name) => (
          <Button
            key={name}
            size="xs"
            type={branch === name ? "primary" : "default"}
            aria-pressed={branch === name}
            title={branch === name ? `Current branch: ${name}` : `Switch to ${name}`}
            disabled={busy || Boolean(edit) || !branches.includes(name)}
            onClick={() => switchBranch(name)}
          >
            {name}
          </Button>
        ))}
        {branch !== undefined && !["master", "develop", "stage"].includes(branch) && (
          <span className="text-gray-400">{branch || "Detached HEAD"}</span>
        )}
      </div>
      <Button
        size="xs"
        className={["inline-flex", "h-8", "w-8", "items-center", "justify-center"]}
        title="Git history"
        aria-label="Git history"
        aria-pressed={historyOpen}
        type={historyOpen ? "primary" : "default"}
        disabled={!historyOpen && (busy || Boolean(edit))}
        onClick={openHistory}
      >
        <Icon title={false} aria-hidden="true" icon="code-branch" className={["h-4", "w-4"]} />
      </Button>
      <div className="flex-grow">
        <ContentTypeRender path={path} items={model.actions || []} />
      </div>
      {busy && <span role="status">Loading…</span>}
      <Input
        value={search}
        onChange={setSearch}
        placeholder="Search files"
        aria-label="Search files"
        className="w-32 bg-gray-800 text-gray-200"
      />
      {error && (
        <span role="alert" className="text-red-300">
          {error}
        </span>
      )}
    </Wrapper>
  );
};
export default GitToolbar;
