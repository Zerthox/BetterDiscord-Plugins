import {Filter} from "./filters";

const {Webpack} = BdApi;

export interface Lazy {
    /** Waits for a lazy loaded module. */
    waitFor(filter: Filter): Promise<any>;

    /** Resets the tracked searches for lazy loaded modules. */
    reset(): void;

    /** Aborts search for any lazy loaded modules. */
    abort(): void;
}

export const createLazy = (): Lazy => {
    let controller = new AbortController();

    return {
        waitFor: (filter: Filter) => Webpack.waitForModule(filter, {signal: controller.signal}),
        abort: () => controller.abort(),
        reset: () => controller = new AbortController()
    };
};
