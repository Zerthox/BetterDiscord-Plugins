import {Filter} from "./filters";

const {Webpack} = BdApi;

export interface Lazy {
    /** Waits for a lazy loaded module. */
    waitFor(filter: Filter): Promise<any>;

    /** Aborts search for any lazy loaded modules. */
    abort(): void;
}

export const createLazy = (): Lazy => {
    let controller = new AbortController();

    return {
        waitFor: (filter: Filter) => Webpack.waitForModule(filter, {signal: controller.signal}),
        abort: () => {
            // abort current controller
            controller.abort();

            // new controller for future
            controller = new AbortController();
        }
    };
};
