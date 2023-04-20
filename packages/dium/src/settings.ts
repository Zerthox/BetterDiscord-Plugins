import {React, Flux} from "./modules";
import * as Data from "./api/data";

export type Listener<T> = (current: T) => void;

export type Update<T> = Partial<T> | ((current: T) => Partial<T>);

export type Setter<T> = (update: Update<T>) => void;

export type SettingsType<S extends SettingsStore<any>> = S["defaults"];

export class SettingsStore<T extends Record<string, any>> implements Flux.StoreLike {
    /** Default settings values. */
    defaults: T;

    /** Current settings state. */
    current: T;

    /** Settings load callback. */
    onLoad?: () => void;

    /** Currently registered listeners. */
    listeners: Set<Listener<T>> = new Set();

    /**
     * Creates a new settings store.
     *
     * @param defaults Default settings to use initially & revert to on reset.
     * @param onLoad Optional callback for when the settings are loaded.
     */
    constructor(defaults: T, onLoad?: () => void) {
        this.defaults = defaults;
        this.onLoad = onLoad;
    }

    /** Loads settings. */
    load(): void {
        this.current = {...this.defaults, ...Data.load("settings")};
        this.onLoad?.();
        this._dispatch(false);
    }

    /**
     * Dispatches a settings update.
    *
    * @param save Whether to save the settings.
    */
    _dispatch(save: boolean): void {
        for (const listener of this.listeners) {
            listener(this.current);
        }
        if (save) {
            Data.save("settings", this.current);
        }
    }

    /**
     * Updates settings state.
     *
     * Similar to React's `setState()`.
     *
     * @param settings Partial settings or callback receiving current settings and returning partial settings.
     *
     * @example
     * ```js
     * Settings.update({myKey: "foo"})
     * Settings.update((current) => ({settingA: current.settingB}))
     * ```
     */
    update = (settings: Update<T>): void => {
        // TODO: copy and use comparators?
        Object.assign(this.current, typeof settings === "function" ? settings(this.current) : settings);
        this._dispatch(true);
    };

    /** Resets all settings to their defaults. */
    reset(): void {
        this.current = {...this.defaults};
        this._dispatch(true);
    }

    /** Deletes settings using their keys. */
    delete(...keys: string[]): void {
        for (const key of keys) {
            delete this.current[key];
        }
        this._dispatch(true);
    }

    /**
     * Returns the current settings state.
     *
     * @example
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
     * Similar to Redux' `useSelector()`, but with optional dependencies.
     *
     * @param selector A function selecting a part of the current settings.
     * @param deps Dependencies of the selector.
     * @param compare An equality function to compare two results of the selector. Strict equality `===` by default.
     *
     * @example
     * ```js
     * const entry = Settings.useSelector((current) => current.entry);
     * ```
     */
    useSelector<R>(selector: (current: T) => R, deps?: React.DependencyList, compare?: Flux.Comparator<R>): R {
        return Flux.useStateFromStores([this], () => selector(this.current), deps, compare);
    }

    /**
     * Returns the current settings state & a setter function.
     *
     * Similar to React's `useState()`;
     *
     * @example
     * ```js
     * const [currentSettings, setSettings] = Settings.useState();
     * ```
     */
    useState(): [T, Setter<T>] {
        return Flux.useStateFromStores([this], () => [
            this.current,
            this.update
        ]);
    }

    /**
     * Returns the current settings state, defaults & a setter function.
     *
     * Similar to React's `useState()`, but with another entry.
     *
     * @example
     * ```js
     * const [currentSettings, defaultSettings, setSettings] = Settings.useStateWithDefaults();
     * ```
     */
    useStateWithDefaults(): [T, T, Setter<T>] {
        return Flux.useStateFromStores([this], () => [
            this.current,
            this.defaults,
            this.update
        ]);
    }

    /**
     * Adds a new settings change listener from within a component.
     *
     * @param listener Listener function to be called when settings state changes.
     * @param deps Dependencies of the listener function. Defaults to the listener function itself.
     */
    useListener(listener: Listener<T>, deps?: React.DependencyList): void {
        React.useEffect(() => {
            this.addListener(listener);
            return () => this.removeListener(listener);
        }, deps ?? [listener]);
    }

    /** Registers a new settings change listener. */
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

    // compatibility with discord's flux interface
    addReactChangeListener = this.addListener;
    removeReactChangeListener = this.removeListener;
}

/**
 * Creates new settings.
 *
 * For details see {@link SettingsStore}.
 */
export const createSettings = <T extends Record<string, any>>(defaults: T, onLoad?: () => void): SettingsStore<T> => new SettingsStore(defaults, onLoad);
