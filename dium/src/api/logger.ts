import {meta} from "../meta";

export type Output = (...data: any[]) => void;

const COLOR = "#3a71c1";

/** Prints data to a custom output. */
export const print = (output: Output, ...data: any[]): void => output(
    `%c[${meta.name}] %c${meta.version ? `(v${meta.version})` : ""}`,
    `color: ${COLOR}; font-weight: 700;`,
    "color: #666; font-size: .8em;",
    ...data
);

/** Logs a message to the console. */
export const log = (...data: any[]): void => print(console.log, ...data);

/** Logs a warning to the console. */
export const warn = (...data: any[]): void => print(console.warn, ...data);

/** Logs an error to the console. */
export const error = (...data: any[]): void => print(console.error, ...data);
