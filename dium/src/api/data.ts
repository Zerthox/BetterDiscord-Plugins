import {getMeta} from "../meta";

/** Loads data from a key. */
export const load = (key: string): any => BdApi.Data.load(getMeta().name, key);

/** Saves data to a key. */
export const save = (key: string, value: unknown): void => BdApi.Data.save(getMeta().name, key, value);

/** Deletes data stored under a key. */
export const deleteEntry = (key: string): void => BdApi.Data.delete(getMeta().name, key);
