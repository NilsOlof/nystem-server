import session from "./session";

export default (app) => {
  session(app);

  const addContents = (token) => ({
    method: "POST",
    body: JSON.stringify({ token }),
  });

  app.on("login", -100, ({ token }) => {
    if (!token) return;
    fetch("/login", addContents(token));
  });

  app.on("logout", -100, ({ token }) => {
    if (!token) return;
    fetch("/logout", addContents(token));
  });
};
