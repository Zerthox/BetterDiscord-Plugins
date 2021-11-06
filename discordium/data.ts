// we assume bd env for now

export interface Data<
    Content extends Record<string, any>
> {
    load<K extends string>(key: K): Content[K];
    save<K extends string>(key: K, value: Content[K]): void;
    delete<K extends string>(key: K): void;
}

export const createData = <Content>(id: string): Data<Content> => ({
    load: (key) => BdApi.loadData(id, key) ?? null,
    save: (key, value) => BdApi.saveData(id, key, value),
    delete: (key) => BdApi.deleteData(id, key)
});
