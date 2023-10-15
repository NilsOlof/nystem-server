import { Wrapper, ContentTypeRender, UseUser } from "nystem-components";

const contains = (array1, array2) => {
  if (!(array1 instanceof Array)) array1 = [array1];
  if (!(array2 instanceof Array)) array2 = [array2];
  for (let i = 0; i < array1.length; i++)
    if (array2.indexOf(array1[i]) !== -1) return true;

  return false;
};

const SessionRole = ({ userrole, model = {}, children, path, className }) => {
  const user = UseUser();

  let reqRole = model.role || userrole;
  reqRole = typeof reqRole === "string" ? reqRole.split(" ") : reqRole;
  const { role } = user || {};
  const userRole = role ? ["logged-in"].concat(role) : "logged-out";

  const visible = contains(userRole, reqRole);

  if (!visible) return null;

  if (children)
    return (
      <Wrapper className={model.className || className}>{children}</Wrapper>
    );

  return (
    <Wrapper className={model.className}>
      <ContentTypeRender path={path} items={model.item} />
    </Wrapper>
  );
};

export default SessionRole;
