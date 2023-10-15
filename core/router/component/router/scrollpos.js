import { useEffect } from "react";

const positions = {};
let count = 0;

const setPos = () => {
  if (
    document.documentElement.scrollTop === positions[window.location.pathname]
  )
    return;

  count++;
  if (count === 5) {
    count = 0;
    return;
  }

  document.documentElement.scrollTop = positions[window.location.pathname] || 0;
  setTimeout(setPos, 120);
};

const RouterScrollpos = () => {
  useEffect(() => {
    window.addEventListener(
      "popstate",
      () => positions[window.location.pathname] && setTimeout(setPos, 120)
    );
    window.addEventListener("pushstate", () => {
      document.documentElement.scrollTop = 0;
      setTimeout(() => {
        document.documentElement.scrollTop = 0;
      }, 100);
    });

    window.addEventListener("scroll", () => {
      positions[window.location.pathname] = document.documentElement.scrollTop;
    });
  }, []);

  return null;
};

export default RouterScrollpos;
