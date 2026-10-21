import Reconciler from "react-reconciler";
import { ConcurrentRoot, DefaultEventPriority, NoEventPriority } from "react-reconciler/constants";

const noop = () => {};
const context = {};
let priority = NoEventPriority;

// Reconcile components and run hooks, but discard every host mutation.
const reconciler = Reconciler({
  isPrimaryRenderer: true,
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  getRootHostContext: () => context,
  getChildHostContext: () => context,
  getPublicInstance: () => null,
  createInstance: () => ({}),
  createTextInstance: () => ({}),
  shouldSetTextContent: () => false,
  finalizeInitialChildren: () => false,
  prepareForCommit: () => null,
  resetAfterCommit: noop,
  appendInitialChild: noop,
  appendChild: noop,
  appendChildToContainer: noop,
  insertBefore: noop,
  insertInContainerBefore: noop,
  removeChild: noop,
  removeChildFromContainer: noop,
  commitUpdate: noop,
  commitTextUpdate: noop,
  resetTextContent: noop,
  clearContainer: noop,
  hideInstance: noop,
  unhideInstance: noop,
  hideTextInstance: noop,
  unhideTextInstance: noop,
  detachDeletedInstance: noop,
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  supportsMicrotasks: true,
  scheduleMicrotask: queueMicrotask,
  getCurrentUpdatePriority: () => priority,
  setCurrentUpdatePriority: (value) => {
    priority = value;
  },
  resolveUpdatePriority: () => priority || DefaultEventPriority,
  maySuspendCommit: () => false,
  maySuspendCommitOnUpdate: () => false,
  maySuspendCommitInSyncRender: () => false,
  shouldAttemptEagerTransition: () => false,
  trackSchedulerEvent: noop,
  resolveEventType: () => null,
  resolveEventTimeStamp: () => -1,
  preloadInstance: () => true,
  startSuspendingCommit: noop,
  waitForCommitToBeReady: () => null,
  suspendOnActiveViewTransition: noop,
  NotPendingTransition: null,
  HostTransitionContext: null,
  resetFormInstance: noop,
  bindToConsole: (method, args) => console[method].bind(console, ...args),
});

export default {
  createRoot() {
    const root = reconciler.createContainer(
      {},
      ConcurrentRoot,
      null,
      false,
      null,
      "",
      console.error,
      console.error,
      console.error,
      null,
    );
    return {
      render: (element) => reconciler.updateContainer(element, root, null, null),
      unmount: () => reconciler.updateContainer(null, root, null, null),
    };
  },
};
