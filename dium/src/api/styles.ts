import {getMeta} from "../meta";

/** Inject CSS. */
export const inject = (styles?: string): void => {
    if (typeof styles === "string") {
        BdApi.DOM.addStyle(getMeta().name, styles);
    }
};

/** Clear previously injected CSS. */
export const clear = (): void => BdApi.DOM.removeStyle(getMeta().name);
