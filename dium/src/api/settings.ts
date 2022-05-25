import {Data} from "./data";
import {Flux} from "../modules";
import {Action, Listener as DispatchListener} from "../modules/flux";

export type Listener<Data> = (data: Data) => void;

export type Update<Data> = Partial<Data> | ((current: Data) => Partial<Data>);

export type Setter<Data> = (update: Update<Data>) => void;

interface SettingsAction<SettingsType> extends Action {
    type: "update";
    current: SettingsType;
}

class Settings<
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType}
> extends Flux.Store {
    defaults: SettingsType;
    protected listeners: Map<Listener<SettingsType>, DispatchListener<SettingsAction<SettingsType>>>;
    protected current: SettingsType;

    constructor(Data: Data<DataType>, defaults: SettingsType) {
        super(new Flux.Dispatcher(), {
            update: ({current}) => Data.save("settings", current)
        });
        this.listeners = new Map();

        this.defaults = defaults;
        this.current = {...defaults, ...Data.load("settings")};
    }

    /** Dispatches a settings update. */
    dispatch(): void {
        this._dispatcher.dirtyDispatch({type: "update", current: this.current});
    }

    /** Returns current settings state. */
    get(): SettingsType {
        return {...this.current};
    }

    /**
     * Updates settings state partially.
     *
     * Similar interface to React's `setState()`.
     */
    set(settings: Update<SettingsType>): void {
        Object.assign(
            this.current,
            settings instanceof Function ? settings(this.get()) : settings
        );
        this.dispatch();
    }

    /** Resets all settings to their defaults. */
    reset(): void {
        this.set({...this.defaults});
    }

    /** Deletes settings using their keys. */
    delete(...keys: string[]): void {
        for (const key of keys) {
            delete this.current[key];
        }
        this.dispatch();
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
            () => this.get()
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
            () => [this.get(), (settings) => this.set(settings)]
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
            () => [this.get(), this.defaults, (settings) => this.set(settings)]
        );
    }

    /** Registers a new listener to be called on settings state changes. */
    addListener(listener: Listener<SettingsType>): Listener<SettingsType> {
        const wrapper = ({current}: SettingsAction<SettingsType>) => listener(current);
        this.listeners.set(listener, wrapper);
        this._dispatcher.subscribe("update", wrapper);
        return listener;
    }

    /** Removes a previously added settings change listener. */
    removeListener(listener: Listener<SettingsType>): void {
        const wrapper = this.listeners.get(listener);
        if (wrapper) {
            this._dispatcher.unsubscribe("update", wrapper);
            this.listeners.delete(listener);
        }
    }

    /** Removes all current settings change listeners. */
    removeAllListeners(): void {
        for (const wrapper of this.listeners.values()) {
            this._dispatcher.unsubscribe("update", wrapper);
        }
        this.listeners.clear();
    }
}

export type {Settings};

export const createSettings = <
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType}
>(Data: Data<DataType>, defaults: SettingsType): Settings<SettingsType, DataType> => new Settings(Data, defaults);
