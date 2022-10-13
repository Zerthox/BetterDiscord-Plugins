export interface Styles {
    /** Inject CSS. */
    inject(styles?: string): void;

    /** Clear previously injected CSS. */
    clear(): void;
}

export const createStyles = (id: string): Styles => {
    return {
        inject(styles) {
            if (typeof styles === "string") {
                BdApi.DOM.addStyle(id, styles);
            }
        },
        clear: () => BdApi.DOM.removeStyle(id)
    };
};
