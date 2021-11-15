import {React} from "./modules";
import {ReactDOMInternals, Fiber} from "./react";

export const sleep = (duration: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, duration));

export const alert = (title: string, content: string | JSX.Element): void => BdApi.alert(title, content);

export type ConfirmOptions = BdApi.ConfirmationModalOptions;

// TODO: change to promise<boolean>?
export const confirm = (title: string, content: string | JSX.Element, options: ConfirmOptions = {}) => BdApi.showConfirmationModal(title, content, options);

export const enum ToastType {
    Default = "",
    Info = "info",
    Success = "success",
    Warn = "warn",
    Warning = "warning",
    Danger = "danger",
    Error = "error"
}

export interface ToastOptions extends BdApi.ToastOptions {
    type?: ToastType;
}

export const toast = (content: string, options: ToastOptions) => BdApi.showToast(content, options);

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

export const getFiber = (node: Node): Fiber => ReactDOMInternals.getInstanceFromNode(node ?? {} as Node);

export const enum Direction {
    None = "",
    Up = "up",
    Down = "down",
    Both = "both"
}

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

export interface OwnerFiber extends Fiber {
    stateNode: React.Component;
}

export const findOwner = (fiber: Fiber): OwnerFiber | null => {
    return queryFiber(fiber, (node) => node?.stateNode instanceof React.Component, Direction.Up, 50);
};
