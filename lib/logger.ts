/* eslint-disable @typescript-eslint/no-explicit-any */

type Output = (...data: any[]) => void;

export interface Logger {
    print(output: Output, ...data: any[]): void;
    log: Output;
    warn: Output;
    error: Output;
}

export const createLogger = (name: string, color: string, version: string): Logger => {
    const print = (output: Output, ...data: any[]) => output(
        `%c[${name}] %c${version ? `(v${version})` : ""}`,
        `color: ${color}; font-weight: 700;`,
        "color: #666; font-size: .8em;",
        ...data
    );
    return {
        print,
        log: (...data) => print(console.log, ...data),
        warn: (...data) => print(console.warn, ...data),
        error: (...data) => print(console.error, ...data)
    };
};
