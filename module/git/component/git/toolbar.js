import React, { useContext } from "react";
import { Button, ContentTypeRender, Input, Wrapper } from "nystem-components";
import { GitContext } from "../../client/context";
const GitToolbar = ({ model, path }) => {
  const { search, setSearch, refresh, busy, error } = useContext(GitContext);
  return <Wrapper className={model.className}>
    <ContentTypeRender path={path} items={model.item || []} />
    <span className="flex-grow text-gray-400">Pending files, sorted by path</span>
    <Input value={search} onChange={setSearch} placeholder="Search files" aria-label="Search files" className="w-60 bg-gray-800 text-gray-200" />
    <Button size="xs" disabled={busy} onClick={refresh}>Refresh</Button>
    {busy && <span role="status">Loading…</span>}
    {error && <span role="alert" className="text-red-300">{error}</span>}
  </Wrapper>;
};
export default GitToolbar;
