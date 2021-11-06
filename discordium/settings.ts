import {Flux, Dispatcher} from "./modules";
import {Data} from "./data";

export type Listener<D> = (data: D) => void;

export class Settings<S extends Record<string, any>, D extends {settings: S}> extends Flux.Store {
    defaults: S;
    protected listeners: Set<Listener<S>>;
    protected current: S;

    constructor(Data: Data<D>, defaults: S) {
        super(new Dispatcher(), {
            update: ({current}) => Data.save("settings", current)
        });
        this.listeners = new Set();

        this.defaults = defaults;
        this.current = {...defaults};
    }

    get(): S {
        return {...this.current};
    }

    set(settings: Partial<S> | ((current: S) => Partial<S>)): void {
        Object.assign(
            this.current,
            settings instanceof Function ? settings(this.get()) : settings
        );
        this._dispatcher.dispatch({type: "update", current: this.current});
    }

    reset(): void {
        this.current = {...this.defaults};
    }

    connect<P>(component: React.ComponentType<S & P>): React.ComponentClass<P> {
        return Flux.connectStores<P, S>(
            [this],
            () => this.get()
        )(component);
    }

    addListener(listener: Listener<S>): Listener<S> {
        this.listeners.add(listener);
        this._dispatcher.subscribe("update", listener);
        return listener;
    }

    removeListener(listener: Listener<S>): void {
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

export const createSettings = <S, D extends {settings: S}>(Data: Data<D>, defaults: S): Settings<S, D> => new Settings(Data, defaults);
