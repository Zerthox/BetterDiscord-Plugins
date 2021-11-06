import path from "path";
import {promises as fs, readdirSync, readFileSync} from "fs";
import minimist from "minimist";
import chalk from "chalk";
import * as rollup from "rollup";
import rollupConfig from "../rollup.config";
import {Config} from "discordium";

const repo = "https://github.com/Zerthox/BetterDiscord-Plugins";

const success = (msg: string) => console.log(chalk.green(msg));
const warn = (msg: string) => console.warn(chalk.yellow(`Warn: ${msg}`));
const error = (msg: string) => console.error(chalk.red(`Error: ${msg}`));

// find sources
const sourceFolder = path.resolve(__dirname, "../src");
const sourceEntries = (readdirSync(sourceFolder, {withFileTypes: true}))
    .filter((entry) => entry.isDirectory());
const wscript = readFileSync(path.resolve(__dirname, "wscript.js"), "utf8").split("\n").filter((line) => line.trim().length > 0).join("\n");

// parse args
const args = minimist(process.argv.slice(2), {boolean: ["dev", "watch"]});

// resolve input paths
let inputs: string[] = [];
if (args._.length === 0) {
    inputs = sourceEntries.map((entry) => path.resolve(sourceFolder, entry.name));
} else {
    for (const name of args._) {
        const entry = sourceEntries.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
        if (entry) {
            inputs.push(path.resolve(sourceFolder, entry.name));
        } else {
            warn(`Unknown plugin "${name}"`);
        }
    }
}

// check for inputs
if (inputs.length === 0) {
    error("No plugin inputs");
    process.exit(1);
}

// resolve output directory
const outDir = args.dev ? path.resolve(
    process.platform === "win32" ? process.env.APPDATA
        : process.platform === "darwin" ? path.resolve(process.env.HOME, "Library/Preferences")
            : path.resolve(process.env.HOME, ".config"),
    "BetterDiscord/plugins"
) : path.resolve(__dirname, "../dist/bd");

const watchers: Record<string, rollup.RollupWatcher> = {};

// build each input
for (const input of inputs) {
    const output = path.resolve(outDir, `${path.basename(input)}.plugin.js`);

    if (args.watch) {
        // watch for changes
        watch(input, output).then(() => console.log(`Watching for changes in "${input}"`));
    } else {
        // build once
        build(input, output);
    }
}
if (args.watch) {
    // keep process alive
    process.stdin.resume();
    process.stdin.on("end", () => {
        for (const watcher of Object.values(watchers)) {
            watcher.close();
        }
    });
}

async function build(input: string, output: string) {
    // parse config
    const config = await readConfig(input);
    const {output: outputConfig, ...inputConfig} = rollupConfig;

    // bundle plugin
    const bundle = await rollup.rollup({
        ...inputConfig,
        input: path.resolve(input, "index.tsx")
    });
    await bundle.write({
        ...outputConfig,
        ...genOutputOptions(config, output)
    });
    success(`Built ${config.name} v${config.version} to "${output}"`);

    await bundle.close();
}

async function watch(input: string, output: string) {
    const config = await readConfig(input);
    const {output: outputConfig, ...inputConfig} = rollupConfig;

    // start watching
    const watcher = rollup.watch({
        ...inputConfig,
        input: path.resolve(input, "index.tsx"),
        output: {
            ...outputConfig,
            ...genOutputOptions(config, output)
        }
    });

    // close finished bundles
    watcher.on("event", (event) => {
        if (event.code === "BUNDLE_END") {
            success(`Built ${config.name} v${config.version} to "${output}" [${event.duration}ms]`);
            event.result.close();
        }
    });

    // restart on config changes
    const configPath = resolveConfig(input);
    watcher.on("change", (file) => {
        // check for config changes
        if (file === configPath) {
            watchers[input].close();
            watch(input, output);
        }

        console.log(`=> Changed "${file}"`);
    });

    watchers[input] = watcher;
}

interface Meta extends Config<unknown> {
    authorLink?: string;
    updateUrl?: string;
    website?: string;
    source?: string;
    donate?: string;
}

function resolveConfig(input: string): string {
    return path.resolve(input, "config.json");
}

async function readConfig(input: string): Promise<Meta> {
    const config = JSON.parse(await fs.readFile(resolveConfig(input), "utf8")) as Config<unknown>;
    return {
        ...config,
        authorLink: `https://github.com/${config.author}`,
        website: repo,
        source: `${repo}/tree/master/src/${path.basename(input)}`,
        updateUrl: `${repo}/blob/master/dist/bd/${path.basename(input)}.plugin.js`
    };
}

function toMeta(config: Config<unknown>): string {
    let result = "/**";
    for (const [key, value] of Object.entries(config)) {
        result += `\n * @${key} ${value.replace(/\n/g, "\\n")}`;
    }
    return result + "\n**/\n";
}

function genOutputOptions(config: Config<unknown>, output: string) {
    return {
        file: output,
        banner: toMeta(config) + `\n/*@cc_on @if (@_jscript)\n${wscript}\n@else @*/\n`,
        footer: "\n/*@end @*/"
    };
}
