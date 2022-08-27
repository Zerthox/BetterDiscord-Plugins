import {React, Flux} from "../modules";
import type {Data} from "./data";
import type {Action} from "../modules/flux";

export type Listener<Data> = (data: Data) => void;

export type Update<Data> = Partial<Data> | ((current: Data) => Partial<Data>);

export type Setter<Data> = (update: Update<Data>) => void;

interface SettingsAction<SettingsType> extends Action {
    type: "update";
    settings: Partial<SettingsType>;
}

class Settings<
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType}
> extends Flux.Store {
    /** Default settings values. */
    defaults: SettingsType;

    /** Current settings state. */
    current: SettingsType;

    protected listeners: Set<Listener<SettingsType>>;

    constructor(Data: Data<DataType>, defaults: SettingsType) {
        super(new Flux.Dispatcher(), {
            update: ({settings}: SettingsAction<SettingsType>) => {
                Object.assign(this.current, settings);
                for (const listener of this.listeners) {
                    listener(this.current);
                }
                Data.save("settings", this.current);
            }
        });

        this.listeners = new Set();
        this.defaults = defaults;
        this.current = {...defaults, ...Data.load("settings")};
    }

    /** Dispatches a settings update. */
    dispatch(settings: Partial<SettingsType>): void {
        this._dispatcher.dispatch<SettingsAction<SettingsType>>({
            type: "update",
            settings
        });
    }

    /**
     * Updates settings state partially.
     *
     * Similar interface to React's `setState()`.
     */
    update(settings: Update<SettingsType>): void {
        this.dispatch(typeof settings === "function" ? settings(this.current) : settings);
    }

    /** Resets all settings to their defaults. */
    reset(): void {
        this.dispatch({...this.defaults});
    }

    /** Deletes settings using their keys. */
    delete(...keys: string[]): void {
        const settings = {...this.current};
        for (const key of keys) {
            delete settings[key];
        }
        this.dispatch(settings);
    }

    /**
     * Returns the current settings state.
     *
     * ```js
     * const currentSettings = Settings.useCurrent();
     * ```
     */
    useCurrent(): SettingsType {
        return Flux.useStateFromStores(
            [this],
            () => this.current
        );
    }

    /**
     * Returns the current settings state & a setter function.
     *
     * ```js
     * const [currentSettings, setSettings] = Settings.useState();
     * ```
     */
    useState(): [SettingsType, Setter<SettingsType>] {
        return Flux.useStateFromStores(
            [this],
            () => [this.current, (settings) => this.update(settings)]
        );
    }

    /**
     * Returns the current settings state, defaults & a setter function.
     *
     * ```js
     * const [currentSettings, defaultSettings, setSettings] = Settings.useStateWithDefaults();
     * ```
     */
    useStateWithDefaults(): [SettingsType, SettingsType, Setter<SettingsType>] {
        return Flux.useStateFromStores(
            [this],
            () => [this.current, this.defaults, (settings) => this.update(settings)]
        );
    }

    /** Adds a new listener from within a component. */
    useListener(listener: Listener<SettingsType>): void {
        React.useEffect(() => {
            this.addListener(listener);
            return () => this.removeListener(listener);
        }, [listener]);
    }

    /** Registers a new listener to be called on settings state changes. */
    addListener(listener: Listener<SettingsType>): Listener<SettingsType> {
        this.listeners.add(listener);
        return listener;
    }

    /** Removes a previously added settings change listener. */
    removeListener(listener: Listener<SettingsType>): void {
        this.listeners.delete(listener);
    }

    /** Removes all current settings change listeners. */
    removeAllListeners(): void {
        this.listeners.clear();
    }
}

export type {Settings};

export const createSettings = <
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType}
>(Data: Data<DataType>, defaults: SettingsType): Settings<SettingsType, DataType> => new Settings(Data, defaults);
