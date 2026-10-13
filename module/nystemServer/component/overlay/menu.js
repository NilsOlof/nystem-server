import { useEffect, useId, useRef, useState } from "react";
import { ContentTypeRender, useLocation } from "nystem-components";

const OverlayMenu = ({ model, path }) => {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef();
  const button = useRef();
  const id = useId();
  const { pathname, search } = useLocation();

  useEffect(() => {
    setExpanded(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!expanded) return;

    const onPointerDown = (event) => {
      if (!ref.current.contains(event.target)) setExpanded(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setExpanded(false);
      button.current.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  return (
    <div ref={ref} className="relative mr-1">
      <button
        ref={button}
        type="button"
        aria-label="Main menu"
        aria-expanded={expanded}
        aria-controls={id}
        className="flex h-8 w-8 items-center justify-center rounded text-gray-300 hover:bg-gray-700 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400"
        onClick={() => setExpanded(!expanded)}
      >
        <ContentTypeRender path={path} items={model.header} />
      </button>
      {expanded && (
        <nav
          id={id}
          aria-label="Main menu"
          className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 p-1.5 text-sm font-normal shadow-xl"
          onClick={() => setExpanded(false)}
        >
          <ContentTypeRender path={path} items={model.item} />
        </nav>
      )}
    </div>
  );
};

export default OverlayMenu;
