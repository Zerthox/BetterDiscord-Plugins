import {Meta} from "betterdiscord";
import path from "path";

/** Meta of this plugin. */
export const meta: Meta = BdApi.Plugins.get(path.basename(module.filename));

/** Id of this plugin. */
export const ID: string = meta.name;
