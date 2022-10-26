import type * as BD from "betterdiscord";

export type Meta = BD.Meta;

/** Meta of this plugin. */
let meta: Meta = null;

export const getMeta = (): Meta => {
    if (meta) {
        return meta;
    } else {
        throw Error("Accessing meta before initialization");
    }
};

/**
 * Updates the plugin meta.
 *
 * This is populated with information automatically, but can be called manually as well.
 */
export const setMeta = (newMeta: Meta): void => {
    meta = newMeta;
};
