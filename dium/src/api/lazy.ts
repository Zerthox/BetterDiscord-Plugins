import {Filter} from "../filters";
import type {FindOptions} from "../finder";

export interface Lazy {
    /** Waits for a lazy loaded module. */
    waitFor(filter: Filter, options?: FindOptions): Promise<any>;

    /** Aborts search for any lazy loaded modules. */
    abort(): void;
}

// TODO: waitFor with callback that is skipped when aborted?

export const createLazy = (): Lazy => {
    let controller = new AbortController();

    return {
        waitFor: (filter, {resolve = true, entries = false}) => BdApi.Webpack.waitForModule(filter, {
            signal: controller.signal,
            defaultExport: resolve,
            searchExports: entries
        } as any),
        abort: () => {
            // abort current controller
            controller.abort();

            // new controller for future
            controller = new AbortController();
        }
    };
};
