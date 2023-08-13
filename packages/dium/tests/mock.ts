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
    isPrimaryRenderer: true,
    supportsHydration: false,
    createContainerChildSet: noop,
    appendChildToContainerChildSet: noop,
    finalizeContainerChildren: noop,
    clearContainer: noop,
    appendChildToContainer: noop,
    getRootHostContext: noop,
    prepareForCommit: noop,
    resetAfterCommit: noop,
    getChildHostContext: noop,
    shouldSetTextContent: noop,
    createInstance: noop,
    createTextInstance: noop,
    appendInitialChild: noop,
    finalizeInitialChildren: noop,
    supportsPersistence: noop,
    prepareUpdate: noop,
    preparePortalMount: noop,
    getPublicInstance: noop,
    getInstanceFromNode: noop,
    getCurrentEventPriority: noop,
    beforeActiveInstanceBlur: noop,
    afterActiveInstanceBlur: noop,
    prepareScopeUpdate: noop,
    getInstanceFromScope: noop,
    detachDeletedInstance: noop,
    scheduleTimeout: noop,
    cancelTimeout: noop,
    noTimeout: -1
});

export const createFiber = (element: React.ReactElement<any>): Fiber => {
    const root = reconciler.createContainer({}, LegacyRoot, null, false, false, "", null, null);
    reconciler.updateContainer(element, root);
    return root.current;
};
