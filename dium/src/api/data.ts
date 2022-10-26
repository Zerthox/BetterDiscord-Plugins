import {meta} from "../meta";

/** Loads a data from a key. */
export const load = (key: string): any => BdApi.Data.load(meta.name, key);

/** Saves data to a key. */
export const save = (key: string, value: unknown): void => BdApi.Data.save(meta.name, key, value);

/** Deletes data stored under a key. */
export const deleteEntry = (key: string): void => BdApi.Data.delete(meta.name, key);
