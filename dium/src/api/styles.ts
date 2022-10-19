import {ID} from "../meta";

/** Inject CSS. */
export const inject = (styles?: string): void => {
    if (typeof styles === "string") {
        BdApi.DOM.addStyle(ID, styles);
    }
};

/** Clear previously injected CSS. */
export const clear = (): void => BdApi.DOM.removeStyle(ID);
