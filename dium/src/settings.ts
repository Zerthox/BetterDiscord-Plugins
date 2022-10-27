import {React, Flux, Comparator} from "./modules";
import * as Data from "./api/data";

export type Listener<T> = (data: T) => void;

export type Update<T> = Partial<T> | ((current: T) => Partial<T>);

export type Setter<T> = (update: Update<T>) => void;

export type SettingsType<S extends SettingsStore<any>> = S["defaults"];

export class SettingsStore<T extends Record<string, any>> extends Flux.Store {
    /** Default settings values. */
    defaults: T;

    /** Current settings state. */
    current: T;

    protected listeners: Set<Listener<T>>;

    constructor(defaults: T) {
        super(new Flux.Dispatcher(), {
            update: () => {
                for (const listener of this.listeners) {
                    listener(this.current);
                }
                Data.save("settings", this.current);
            }
        });

        this.listeners = new Set();
        this.defaults = defaults;
    }

    load(): void {
        this.current = {...this.defaults, ...Data.load("settings")};
    }

    /** Dispatches a settings update. */
    _dispatch(): void {
        this._dispatcher.dispatch({type: "update"});
    }

    /**
     * Updates settings state partially.
     *
     * Similar interface to React's `setState()`.
     */
    update(settings: Update<T>): void {
        Object.assign(this.current, typeof settings === "function" ? settings(this.current) : settings);
        this._dispatch();
    }

    /** Resets all settings to their defaults. */
    reset(): void {
        this.current = {...this.defaults};
        this._dispatch();
    }

    /** Deletes settings using their keys. */
    delete(...keys: string[]): void {
        for (const key of keys) {
            delete this.current[key];
        }
        this._dispatch();
    }

    /**
     * Returns the current settings state.
     *
     * ```js
     * const currentSettings = Settings.useCurrent();
     * ```
     */
    useCurrent(): T {
        return Flux.useStateFromStores([this], () => this.current, undefined, () => false);
    }

    /**
     * Returns the current settings state mapped with a selector.
     *
     * ```js
     * const entry = Settings.useSelector((current) => current.entry);
     * ```
     */
    useSelector<R>(selector: (current: T) => R, deps?: React.DependencyList, compare?: Comparator<R>): R {
        return Flux.useStateFromStores([this], () => selector(this.current), deps, compare);
    }

    /**
     * Returns the current settings state & a setter function.
     *
     * ```js
     * const [currentSettings, setSettings] = Settings.useState();
     * ```
     */
    useState(): [T, Setter<T>] {
        return Flux.useStateFromStores([this], () => [
            this.current,
            (settings) => this.update(settings)
        ]);
    }

    /**
     * Returns the current settings state, defaults & a setter function.
     *
     * ```js
     * const [currentSettings, defaultSettings, setSettings] = Settings.useStateWithDefaults();
     * ```
     */
    useStateWithDefaults(): [T, T, Setter<T>] {
        return Flux.useStateFromStores([this], () => [
            this.current,
            this.defaults,
            (settings) => this.update(settings)
        ]);
    }

    /** Adds a new listener from within a component. */
    useListener(listener: Listener<T>): void {
        React.useEffect(() => {
            this.addListener(listener);
            return () => this.removeListener(listener);
        }, [listener]);
    }

    /** Registers a new listener to be called on settings state changes. */
    addListener(listener: Listener<T>): Listener<T> {
        this.listeners.add(listener);
        return listener;
    }

    /** Removes a previously added settings change listener. */
    removeListener(listener: Listener<T>): void {
        this.listeners.delete(listener);
    }

    /** Removes all current settings change listeners. */
    removeAllListeners(): void {
        this.listeners.clear();
    }
}

export const createSettings = <T extends Record<string, any>>(defaults: T): SettingsStore<T> => new SettingsStore(defaults);
