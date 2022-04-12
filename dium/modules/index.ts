import * as npm from "./npm";
import * as flux from "./flux";
import * as discord from "./discord";

type ModuleProxy<T extends Record<string, () => any>> = {
    [P in keyof T]: ReturnType<T[P]>;
};

const createProxy = <T extends Record<string, () => any>>(
    entries: T
): ModuleProxy<T> => {
    const result = {};
    for (const [key, value] of Object.entries(entries)) {
        Object.defineProperty(result, key, {
            enumerable: true,
            configurable: true,
            get() {
                delete this[key];
                this[key] = value();
                return this[key];
            }
        });
    }
    return result as ModuleProxy<T>;
};

const Modules = createProxy({
    ...npm,
    ...flux,
    ...discord
});

export default Modules;

export const {React, ReactDOM, classNames, lodash, Flux} = Modules;
