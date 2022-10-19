import type {Filter} from "./filters";
import type {FindOptions} from "./finder";

let controller = new AbortController();

/** Waits for a lazy loaded module. */
// TODO: waitFor with callback that is skipped when aborted?
export const waitFor = (filter: Filter, {resolve = true, entries = false}: FindOptions = {}): Promise<any> => BdApi.Webpack.waitForModule(filter, {
    signal: controller.signal,
    defaultExport: resolve,
    searchExports: entries
} as any);

/** Aborts search for any lazy loaded modules. */
export const abort = (): void => {
    // abort current controller
    controller.abort();

    // new controller for future
    controller = new AbortController();
};
