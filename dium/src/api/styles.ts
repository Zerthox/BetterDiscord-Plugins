import {getMeta} from "../meta";

/** Inject CSS. */
export const inject = (styles?: string): void => {
    if (typeof styles === "string") {
        BdApi.DOM.addStyle(getMeta().name, styles);
    }
};

/** Clear previously injected CSS. */
export const clear = (): void => BdApi.DOM.removeStyle(getMeta().name);

/** Create suffixed versions for a list of class names. */
export const suffix = <T extends string = never>(...classNames: T[]): Record<T, string> => {
    const result: Record<T, string> = {} as any;
    for (const className of classNames) {
        Object.defineProperty(result, className, {
            get: () => className + "-" + getMeta().name
        });
    }
    return result;
};
