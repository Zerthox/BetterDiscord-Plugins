import React from "react";
import Reconciler, { Fiber } from "react-reconciler";
import { DefaultEventPriority, LegacyRoot } from "react-reconciler/constants";

(global as any).TESTING = true;

(global as any).BdApi = {
    React,
    Webpack: {
        getModule: () => null,
    },
    Plugins: {
        get: () => ({}),
    },
};

const reconciler = Reconciler({
    supportsMutation: false,
    supportsPersistence: true,
    createInstance() {},
    createTextInstance() {},
    appendInitialChild() {},
    finalizeInitialChildren: () => false,
    shouldSetTextContent: () => false,
    getRootHostContext: () => ({}),
    getChildHostContext: (parent) => parent,
    getPublicInstance: (instance) => instance,
    prepareForCommit: () => null,
    resetAfterCommit() {},
    preparePortalMount() {},
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,
    isPrimaryRenderer: true,
    cloneInstance() {},
    createContainerChildSet() {},
    appendChildToContainerChildSet() {},
    finalizeContainerChildren() {},
    replaceContainerChildren() {},
    cloneHiddenInstance() {},
    cloneHiddenTextInstance() {},
    getInstanceFromNode: () => null,
    beforeActiveInstanceBlur() {},
    afterActiveInstanceBlur() {},
    prepareScopeUpdate() {},
    getInstanceFromScope() {},
    detachDeletedInstance() {},
    supportsHydration: false,
    NotPendingTransition: null,
    HostTransitionContext: React.createContext(null) as any,
    setCurrentUpdatePriority() {},
    getCurrentUpdatePriority: () => DefaultEventPriority,
    resolveUpdatePriority: () => DefaultEventPriority,
    resetFormInstance() {},
    requestPostPaintCallback() {},
    shouldAttemptEagerTransition: () => true,
    trackSchedulerEvent() {},
    resolveEventType: () => null,
    resolveEventTimeStamp: () => 0,
    maySuspendCommit: () => false,
    preloadInstance: () => true,
    startSuspendingCommit() {},
    suspendInstance() {},
    waitForCommitToBeReady: () => null,
});

export const createFiber = (element: React.ReactElement<any>): Fiber => {
    const root = reconciler.createContainer(
        {},
        LegacyRoot,
        null,
        false,
        false,
        "",
        console.error,
        console.warn,
        console.error,
        () => {},
        null,
    );
    (reconciler as any).updateContainerSync(element, root);
    (reconciler as any).flushSyncWork();
    return root.current;
};
