type Output = (...data: any[]) => void;

export interface Log {
    print: (output: Output, ...data: any[]) => void;
    log: Output;
    warn: Output;
    error: Output;
}

export const createLog = (name: string, color: string, version: string): Log => {
    const print = (output: Output, ...data: any[]) => output(
        `%c[${name}] %c${version ? `(v${version})` : ""}`,
        `color: ${color}; font-weight: 700;`,
        "color: #666; font-size: .8em;",
        ...data
    );
    return {
        print,
        log: (...data: any[]) => print(console.log, ...data),
        warn: (...data: any[]) => print(console.warn, ...data),
        error: (...data: any[]) => print(console.error, ...data)
    };
};
