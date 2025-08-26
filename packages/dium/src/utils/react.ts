import * as Patcher from "../api/patcher";
import { React } from "../modules";
import type { JSX, ReactElement, ReactNode } from "react";
import type { Fiber, OwnerFiber } from "../react-internals";

export type FCHookCallback<P> = (result: ReactNode, targetProps: P) => ReactNode | void;

interface FCHookProps<P> {
    children: ReactElement<P, React.FunctionComponent<P>>;
    callback: FCHookCallback<P>;
}

/** Utility component hooking into a function component. */
const FCHook = <P>({ children: { type, props }, callback }: FCHookProps<P>): ReactNode => {
    const result = type(props) as ReactNode;
    return (callback(result, props) as ReactNode) ?? result;
};

/** Hooks into a function component, allowing to modify the rendered elements. */
export const hookFunctionComponent = <P>(
    target: ReactElement<P, React.FunctionComponent<P>>,
    callback: FCHookCallback<P>,
): React.JSX.Element => {
    // replace original with hook component, move target element to children
    const props: FCHookProps<P> = {
        children: { ...target },
        callback,
    };
    target.props = props as any;
    target.type = FCHook as any;

    return target;
};

export type Predicate<Arg> = (arg: Arg) => boolean;

export type ReactTree = ReactNode | ReactNode[] | Promise<ReactNode>;

/**
 * Replaces a React element with another.
 */
export const replaceElement = (target: JSX.Element, replace: JSX.Element): void => {
    target.type = replace.type;
    target.key = replace.key ?? target.key;
    target.props = replace.props;
};

/**
 * Searches a React element tree for the first element matching the predicate.
 *
 * This uses a breadth first search (BFS).
 */
export const queryTree = (node: ReactTree, predicate: Predicate<JSX.Element>): JSX.Element | null => {
    // TODO: queue impl?
    const worklist = [node].flat();

    while (worklist.length !== 0) {
        const node = worklist.shift();
        if (React.isValidElement(node)) {
            // check current node
            if (predicate(node)) {
                return node;
            }

            // add children to worklist
            const children = (node as ReactElement<any>)?.props?.children;
            if (children) {
                worklist.push(...[children].flat());
            }
        }
    }

    return null;
};

/**
 * Searches a React element tree for all elements matching the predicate.
 *
 * This uses a breadth first search (BFS).
 */
export const queryTreeAll = (node: ReactTree, predicate: Predicate<JSX.Element>): JSX.Element[] => {
    const result = [];
    const worklist = [node].flat();

    while (worklist.length !== 0) {
        const node = worklist.shift();
        if (React.isValidElement(node)) {
            // check current node
            if (predicate(node)) {
                result.push(node);
            }

            // add children to worklist
            const children = (node as ReactElement<any>)?.props?.children;
            if (children) {
                worklist.push(...[children].flat());
            }
        }
    }

    return result;
};

export type ElementWithChildren = ReactElement<{ children?: ReactElement[] } & Record<string, any>>;

/**
 * Searches a React element tree for an element whose children are in an array and one child matches the predicate.
 *
 * Returns the parent node and the index.
 */
export const queryTreeForParent = (
    tree: ReactTree,
    predicate: Predicate<JSX.Element>,
): [ElementWithChildren | null, number] => {
    let childIndex = -1;

    const parent = queryTree(tree, (node) => {
        const children = (node as ReactElement<any>)?.props?.children;
        if (children instanceof Array) {
            const index = children.findIndex(predicate);

            if (index > -1) {
                childIndex = index;
                return true;
            }
        }
    });

    return [parent, childIndex];
};

/** Returns the React fiber node corresponding to a DOM node. */
export const getFiber = (node: Node): Fiber => {
    const key = Object.keys(node).find((key) => key.startsWith("__reactFiber"));
    return node?.[key];
};

export const enum Direction {
    None = "",
    Up = "up",
    Down = "down",
    Both = "both",
}

/**
 * Searches a React fiber tree for the first fiber node matching the predicate.
 *
 * This uses a depth first search (DFS) with a maximum depth.
 * Parent nodes are searched first when searching both directions.
 */
export const queryFiber = (
    fiber: Fiber,
    predicate: Predicate<Fiber>,
    direction: Direction | null = Direction.Up,
    depth = 30,
): Fiber | null => {
    // check depth
    if (depth < 0) {
        return null;
    }

    // check current node
    if (predicate(fiber)) {
        return fiber;
    }

    // check parent (upwards)
    if (direction === Direction.Up || direction === Direction.Both) {
        let count = 0;
        let parent = fiber.return;
        while (parent && count < depth) {
            if (predicate(parent)) {
                return parent;
            }
            count++;
            parent = parent.return;
        }
    }

    // check children (downwards)
    if (direction === Direction.Down || direction === Direction.Both) {
        let child = fiber.child;
        while (child) {
            const result = queryFiber(child, predicate, Direction.Down, depth - 1);
            if (result) {
                return result;
            }
            child = child.sibling;
        }
    }

    return null;
};

/** Finds the owner in the parents of a fiber node. */
export const findOwner = (fiber: Fiber, depth = 50): OwnerFiber | null => {
    return queryFiber(fiber, (node) => node?.stateNode instanceof React.Component, Direction.Up, depth);
};

/** Triggers a force update on the fiber node's owner. */
export const forceUpdateOwner = (fiber: Fiber): Promise<boolean> =>
    new Promise((resolve) => {
        // find owner
        const owner = findOwner(fiber);
        if (owner) {
            // force update
            owner.stateNode.forceUpdate(() => resolve(true));
        } else {
            resolve(false);
        }
    });

/**
 * Forces a complete rerender on the fiber node's owner.
 *
 * This removes all child nodes currently rendered by the owner.
 */
export const forceFullRerender = (fiber: Fiber): Promise<boolean> =>
    new Promise((resolve) => {
        // find owner
        const owner = findOwner(fiber);
        if (owner) {
            const { stateNode } = owner;

            // render no elements in next render
            Patcher.instead(stateNode, "render", () => null, { once: true, silent: true });

            // force update twice
            stateNode.forceUpdate(() => stateNode.forceUpdate(() => resolve(true)));
        } else {
            resolve(false);
        }
    });
