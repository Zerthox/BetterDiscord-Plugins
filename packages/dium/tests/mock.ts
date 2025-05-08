import React from "react";
import ReactReconciler, {Fiber} from "react-reconciler";
import {LegacyRoot} from "react-reconciler/constants";

(global as any).TESTING = true;

(global as any).BdApi = {
    React,
    Webpack: {
        getModule: () => null
    },
    Plugins: {
        get: () => ({})
    }
};

const noop: any = () => {};

const reconciler = ReactReconciler({
    supportsMutation: true,
    supportsPersistence: false,
    createInstance: noop,
    createTextInstance: noop,
    appendInitialChild: noop,
    finalizeInitialChildren: noop,
    shouldSetTextContent: noop,
    getRootHostContext: noop,
    getChildHostContext: noop,
    getPublicInstance: noop,
    prepareForCommit: noop,
    resetAfterCommit: noop,
    preparePortalMount: noop,
    scheduleTimeout: noop,
    cancelTimeout: noop,
    noTimeout: -1,
    isPrimaryRenderer: true,
    getInstanceFromNode: noop,
    beforeActiveInstanceBlur: noop,
    afterActiveInstanceBlur: noop,
    prepareScopeUpdate: noop,
    getInstanceFromScope: noop,
    detachDeletedInstance: noop,
    supportsHydration: false,
    NotPendingTransition: null,
    HostTransitionContext: null,
    setCurrentUpdatePriority: noop,
    getCurrentUpdatePriority: noop,
    resolveUpdatePriority: noop,
    resetFormInstance: noop,
    requestPostPaintCallback: noop,
    shouldAttemptEagerTransition: noop,
    trackSchedulerEvent: noop,
    resolveEventType: noop,
    resolveEventTimeStamp: noop,
    maySuspendCommit: noop,
    preloadInstance: noop,
    startSuspendingCommit: noop,
    suspendInstance: noop,
    waitForCommitToBeReady: noop
});

export const createFiber = (element: React.ReactElement<any>): Fiber => {
    const root = reconciler.createContainer({}, LegacyRoot, null, false, false, "", null, null);
    reconciler.updateContainer(element, root);
    return root.current;
};
