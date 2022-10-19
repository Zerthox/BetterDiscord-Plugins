import {ID} from "../meta";

/** Loads a data from a key. */
export const load = (key: string): any => BdApi.Data.load(ID, key);

/** Saves data to a key. */
export const save = (key: string, value: unknown): void => BdApi.Data.save(ID, key, value);

/** Deletes data stored under a key. */
export const deleteEntry = (key: string): void => BdApi.Data.delete(ID, key);
