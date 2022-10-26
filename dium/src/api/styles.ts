import {meta} from "../meta";

/** Inject CSS. */
export const inject = (styles?: string): void => {
    if (typeof styles === "string") {
        BdApi.DOM.addStyle(meta.name, styles);
    }
};

/** Clear previously injected CSS. */
export const clear = (): void => BdApi.DOM.removeStyle(meta.name);
