import {React} from "../modules";
import {ReactDOMInternals, Fiber} from "../api/react";

export type Predicate<Arg> = (arg: Arg) => boolean;

/**
 * Searches a React element tree for the first element matching the predicate.
 *
 * This uses a breadth first search (BFS).
 */
export const queryTree = (node: JSX.Element, predicate: Predicate<JSX.Element>): JSX.Element | null => {
    const worklist = [node];

    while (worklist.length !== 0) {
        const node = worklist.shift();

        // check current node
        if (predicate(node)) {
            return node;
        }

        // add children to worklist
        if (node?.props?.children) {
            worklist.push(...[node.props.children].flat());
        }
    }

    return null;
};

/**
 * Searches a React element tree for all elements matching the predicate.
 *
 * This uses a breadth first search (BFS).
 */
export const queryTreeAll = (node: JSX.Element, predicate: Predicate<JSX.Element>): JSX.Element[] => {
    const result = [];
    const worklist = [node];

    while (worklist.length !== 0) {
        const node = worklist.shift();

        // check current node
        if (predicate(node)) {
            result.push(node);
        }

        // add children to worklist
        if (node?.props?.children) {
            worklist.push(...[node.props.children].flat());
        }
    }

    return result;
};

/** Returns the React fiber node corresponding to a DOM node. */
export const getFiber = (node: Node): Fiber => ReactDOMInternals.getInstanceFromNode(node ?? {} as Node);

export const enum Direction {
    None = "",
    Up = "up",
    Down = "down",
    Both = "both"
}

/**
 * Searches a React fiber tree for the first fiber node matching the predicate.
 *
 * This uses a depth first search (DFS) with a maxiumum depth.
 * Parent nodes are searched first when searching both directions.
 */
export const queryFiber = (fiber: Fiber, predicate: Predicate<Fiber>, direction: Direction | null = Direction.Up, depth = 30, current = 0): Fiber | null => {
    // check depth
    if (current > depth) {
        return null;
    }

    // check current node
    if (predicate(fiber)) {
        return fiber;
    }

    // check parent (upwards)
    if ((direction === Direction.Up || direction === Direction.Both) && fiber.return) {
        const result = queryFiber(fiber.return, predicate, Direction.Up, depth, current + 1);
        if (result) {
            return result;
        }
    }

    // check children (downwards)
    if ((direction === Direction.Down || direction === Direction.Both) && fiber.child) {
        let child = fiber.child;
        while (child) {
            const result = queryFiber(child, predicate, Direction.Down, depth, current + 1);
            if (result) {
                return result;
            }
            child = child.sibling;
        }
    }

    return null;
};

/** A fiber node with React component as state node. */
export interface OwnerFiber extends Fiber {
    stateNode: React.Component<any>;
}

/** Finds the owner in the parents of a fiber node. */
export const findOwner = (fiber: Fiber): OwnerFiber | null => {
    return queryFiber(fiber, (node) => node?.stateNode instanceof React.Component, Direction.Up, 50);
};

/** Triggers a force update on the fiber node's owner. */
export const forceUpdateOwner = (fiber: Fiber): Promise<boolean> => new Promise((resolve) => {
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
export const forceFullRerender = (fiber: Fiber): Promise<boolean> => new Promise((resolve) => {
    // find owner
    const owner = findOwner(fiber);
    if (owner) {
        const {stateNode} = owner;

        // render no elements in next render
        const original = stateNode.render;
        stateNode.render = function forceRerender() {
            original.call(this);
            stateNode.render = original;
            return null;
        };

        // force update twice
        stateNode.forceUpdate(() => stateNode.forceUpdate(() => resolve(true)));
    } else {
        resolve(false);
    }
});
