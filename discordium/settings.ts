import {Flux, Dispatch} from "./modules";
import {Data} from "./data";
import {Dispatch as DispatchTypes} from "./types";

export type Listener<Data> = (data: Data) => void;

export type SettingsProps<SettingsType extends Record<string, any>> = SettingsType & {
    defaults: SettingsType;
    set(settings: Partial<SettingsType> | ((current: SettingsType) => Partial<SettingsType>)): void;
};

interface SettingsEvent<SettingsType> extends DispatchTypes.Event {
    type: "update";
    current: SettingsType;
}

export class Settings<
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType}
> extends Flux.Store {
    defaults: SettingsType;
    protected listeners: Map<Listener<SettingsType>, DispatchTypes.Listener>;
    protected current: SettingsType;

    constructor(Data: Data<DataType>, defaults: SettingsType) {
        super(new Dispatch.Dispatcher(), {
            update: ({current}) => Data.save("settings", current)
        });
        this.listeners = new Map();

        this.defaults = defaults;
        this.current = {...defaults, ...Data.load("settings")};
    }

    get(): SettingsType {
        return {...this.current};
    }

    set(settings: Partial<SettingsType> | ((current: SettingsType) => Partial<SettingsType>)): void {
        Object.assign(
            this.current,
            settings instanceof Function ? settings(this.get()) : settings
        );
        this._dispatcher.dispatch({type: "update", current: this.current});
    }

    reset(): void {
        this.set({...this.defaults});
    }

    // TODO: allow custom mapping?
    connect<Props>(component: React.ComponentType<SettingsProps<SettingsType> & Props>): React.ComponentClass<Props> {
        return Flux.default.connectStores<Props, SettingsProps<SettingsType>>(
            [this],
            () => ({...this.get(), defaults: this.defaults, set: (settings) => this.set(settings)})
        )(component);
    }

    useSettings(): SettingsProps<SettingsType> {
        return Flux.useStateFromStores(
            [this],
            () => ({...this.get(), defaults: this.defaults, set: (settings) => this.set(settings)})
        );
    }

    addListener(listener: Listener<SettingsType>): Listener<SettingsType> {
        const wrapper = ({current}: SettingsEvent<SettingsType>) => listener(current);
        this.listeners.set(listener, wrapper);
        this._dispatcher.subscribe("update", wrapper);
        return listener;
    }

    removeListener(listener: Listener<SettingsType>): void {
        const wrapper = this.listeners.get(listener);
        if (wrapper) {
            this._dispatcher.unsubscribe("update", wrapper);
            this.listeners.delete(listener);
        }
    }

    removeAllListeners(): void {
        for (const wrapper of this.listeners.values()) {
            this._dispatcher.unsubscribe("update", wrapper);
        }
        this.listeners.clear();
    }
}

export const createSettings = <
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType}
>(Data: Data<DataType>, defaults: SettingsType): Settings<SettingsType, DataType> => new Settings(Data, defaults);
