export interface Styles {
    /** Inject CSS. */
    inject(styles?: string): void;

    /** Clear previously injected CSS. */
    clear(): void;
}

export const createStyles = (id: string): Styles => {
    // we assume bd env for now

    return {
        inject(styles) {
            if (typeof styles === "string") {
                BdApi.injectCSS(id, styles);
            }
        },
        clear: () => BdApi.clearCSS(id)
    };
};
