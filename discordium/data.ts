// we assume bd env for now

export interface Data<D extends Record<string, any>> {
    load<K extends string>(key: K): D[K];
    save<K extends string>(key: K, value: D[K]): void;
    delete<K extends string>(key: K): void;
}

export const createData = <D>(id: string): Data<D> => ({
    load: (key) => BdApi.loadData(id, key),
    save: (key, value) => BdApi.saveData(id, key, value),
    delete: (key) => BdApi.deleteData(id, key)
});
