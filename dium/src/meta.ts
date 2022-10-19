import path from "path";
import type * as BD from "betterdiscord";

/** Meta of this plugin. */
export const meta: BD.Meta = BdApi.Plugins.get(path.basename(module.filename));

/** Id of this plugin. */
export const ID: string = meta.name;
