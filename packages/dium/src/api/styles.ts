import {getMeta} from "../meta";
import {PopoutWindowStore} from "../modules/popout-window";

const getOpenWindows = (): Window[] => PopoutWindowStore?.getWindowKeys()
    .filter((key) => PopoutWindowStore.getWindowFocused(key))
    .map((key) => PopoutWindowStore.getWindow(key)) ?? [];

const popoutWindowListener = () => {
    for (const popout of getOpenWindows()) {
        const {name} = getMeta();
        if (!popout.document.getElementById(name)) {
            const el = popout.document.createElement("style");
            el.id = name;
            el.textContent = document.getElementById(name)?.textContent;
            popout.document.head.append(el);
        }
    }
};

/** Inject CSS. */
export const inject = (styles?: string): void => {
    if (typeof styles === "string") {
        BdApi.DOM.addStyle(getMeta().name, styles);
        PopoutWindowStore?.removeChangeListener(popoutWindowListener);
        PopoutWindowStore?.addChangeListener(popoutWindowListener);
    }
};

/** Clear previously injected CSS. */
export const clear = (): void => {
    const {name} = getMeta();
    BdApi.DOM.removeStyle(name);
    PopoutWindowStore?.removeChangeListener(popoutWindowListener);
    for (const popout of getOpenWindows()) {
        popout.document.getElementById(name)?.remove();
    }
};

/** Create suffixed versions for a list of class names. */
export const suffix = <T extends string = never>(...classNames: T[]): Record<T, string> => {
    const result: Record<T, string> = {} as any;
    for (const className of classNames) {
        Object.defineProperty(result, className, {
            get() {
                const value = className + "-" + getMeta().name;
                Object.defineProperty(result, className, {
                    value,
                    configurable: true,
                    enumerable: true
                });
                return value;
            },
            configurable: true,
            enumerable: true
        });
    }
    return result;
};
