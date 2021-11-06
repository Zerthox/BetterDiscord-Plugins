import {Flux, Dispatcher} from "./modules";
import {Data} from "./data";

export type Listener<Data> = (data: Data) => void;

export class Settings<
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType}
> extends Flux.Store {
    defaults: SettingsType;
    protected listeners: Set<Listener<SettingsType>>;
    protected current: SettingsType;

    constructor(Data: Data<DataType>, defaults: SettingsType) {
        super(new Dispatcher(), {
            update: ({current}) => Data.save("settings", current)
        });
        this.listeners = new Set();

        this.defaults = defaults;
        this.current = Data.load("settings") ?? {...defaults};
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

    connect<Props>(component: React.ComponentType<SettingsType & Props>): React.ComponentClass<Props> {
        return Flux.connectStores<Props, SettingsType>(
            [this],
            () => this.get()
        )(component);
    }

    addListener(listener: Listener<SettingsType>): Listener<SettingsType> {
        this.listeners.add(listener);
        this._dispatcher.subscribe("update", listener);
        return listener;
    }

    removeListener(listener: Listener<SettingsType>): void {
        if (this.listeners.has(listener)) {
            this._dispatcher.unsubscribe("update", listener);
            this.listeners.delete(listener);
        }
    }

    removeAllListeners(): void {
        for (const listener of this.listeners) {
            this._dispatcher.unsubscribe("update", listener);
        }
        this.listeners.clear();
    }
}

export const createSettings = <
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType}
>(Data: Data<DataType>, defaults: SettingsType): Settings<SettingsType, DataType> => new Settings(Data, defaults);
