import {Filter} from "./filters";

export interface Lazy {
    /** Waits for a lazy loaded module. */
    waitFor(filter: Filter, resolve?: boolean): Promise<any>;

    /** Aborts search for any lazy loaded modules. */
    abort(): void;
}

// TODO: waitFor with callback that is skipped when aborted?
// when bd makes the promise reject on abort like fetch, we can also just add an error handler to filter out the abort error

export const createLazy = (): Lazy => {
    let controller = new AbortController();

    return {
        waitFor: (filter: Filter, resolve = true) => BdApi.Webpack.waitForModule(filter, {signal: controller.signal, defaultExport: resolve}),
        abort: () => {
            // abort current controller
            controller.abort();

            // new controller for future
            controller = new AbortController();
        }
    };
};
