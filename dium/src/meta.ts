import type * as BD from "betterdiscord";

export type Meta = BD.Meta;

/** Meta of this plugin. */
export const meta: Meta = {} as any;

/**
 * Updates the plugin meta.
 *
 * This is populated with information automatically, but can be called manually as well.
 */
export const setMeta = (newMeta: Partial<Meta>): void => {
    Object.assign(meta, newMeta);
};
