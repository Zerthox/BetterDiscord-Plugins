import {Fiber} from "react-reconciler";

export const sleep = (duration: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, duration));

export type Predicate<Arg> = (arg: Arg) => boolean;

export const queryTree = (node: JSX.Element, predicate: Predicate<JSX.Element>): JSX.Element | null => {
    // check current node
    if (predicate(node)) {
        return node;
    }
    // check children
    if (node?.props?.children) {
        for (const child of [node.props.children].flat()) {
            const result = queryTree(child, predicate);
            if (result) {
                return result;
            }
        }
    }

    return null;
};

export type Direction = null | "up" | "down" | "both";

export const queryFiber = (fiber: Fiber, predicate: Predicate<Fiber>, direction = "up", depth = 30, current = 0): Fiber | null => {
    // check depth
    if (current > depth) {
        return null;
    }

    // check current node
    if (predicate(fiber)) {
        return fiber;
    }

    // check parent (upwards)
    if ((direction === "up" || direction === "both") && fiber.return) {
        const result = queryFiber(fiber.return, predicate, "up", depth, current + 1);
        if (result) {
            return result;
        }
    }

    // check children (downwards)
    if ((direction === "down" || direction === "both") && fiber.child) {
        let child = fiber.child;
        while (child) {
            const result = queryFiber(child, predicate, "down", depth, current + 1);
            if (result) {
                return result;
            }
            child = child.sibling;
        }
    }

    return null;
};
