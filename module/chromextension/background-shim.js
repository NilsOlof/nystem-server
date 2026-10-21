// Browser compatibility for platform initialization; React renders no DOM.
const noop = () => {};
const events = new EventTarget();
const classNames = new Set();
const classList = {
  add: (...names) => names.forEach((name) => classNames.add(name)),
  remove: (...names) => names.forEach((name) => classNames.delete(name)),
  contains: (name) => classNames.has(name),
};
const element = () => ({
  style: {},
  children: [],
  classList,
  appendChild: noop,
  addEventListener: noop,
  removeEventListener: noop,
  setAttribute: noop,
});
const document = {
  body: element(),
  head: element(),
  visibilityState: "visible",
  createElement: element,
  getElementById: () => null,
  addEventListener: events.addEventListener.bind(events),
  removeEventListener: events.removeEventListener.bind(events),
};
const history = { pushState: noop, replaceState: noop };
const location = new URL(globalThis.location.href);
// Session changes and reconnects are handled by platform events in a worker.
location.reload = noop;
globalThis.document = document;
globalThis.history = history;
globalThis.window = {
  document,
  history,
  location,
  chrome: globalThis.chrome,
  navigator: globalThis.navigator,
  caches: globalThis.caches,
  indexedDB: globalThis.indexedDB,
  URL,
  postMessage: noop,
  addEventListener: events.addEventListener.bind(events),
  removeEventListener: events.removeEventListener.bind(events),
  dispatchEvent: events.dispatchEvent.bind(events),
};
