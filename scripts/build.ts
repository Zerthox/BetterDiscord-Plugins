import path from "path";
import {promises as fs, readdirSync, readFileSync} from "fs";
import minimist from "minimist";
import chalk from "chalk";
import {rollup} from "rollup";
import rollupConfig from "./rollup.config";
import {Config} from "../lib";

const warn = (msg: string) => console.warn(chalk.yellow(`Warn: ${msg}`));
const error = (msg: string) => console.error(chalk.red(`Error: ${msg}`));

// find sources
const sourceFolder = path.resolve(__dirname, "../src");
const sourceEntries = (readdirSync(sourceFolder, {withFileTypes: true}))
    .filter((entry) => entry.isDirectory());
const wscript = readFileSync(path.resolve(__dirname, "wscript.js"), "utf8").split("\n").filter((line) => line.trim().length > 0).join("\n");

// parse args
const args = minimist(process.argv.slice(2));

// resolve input paths
let inputs: string[] = [];
if (args._.length === 1 && args._[0] === "*") {
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

// build each input
for (const input of inputs) {
    build(input, path.resolve(__dirname, "../dist"));
}

async function build(input: string, output: string) {
    // parse config
    const config = await resolveConfig(input);
    const {output: outputConfig, ...inputConfig} = rollupConfig;

    // resolve output file
    const outFile = path.resolve(output, `${config.name}.plugin.js`);

    // bundle plugin
    const bundle = await rollup({
        ...inputConfig,
        input: path.resolve(input, "index.tsx")
    });
    await bundle.write({
        ...outputConfig,
        file: outFile,
        banner: toMeta(config) + `\n/*@cc_on @if (@_jscript)\n${wscript}\n@else @*/\n`,
        footer: "\n/*@end @*/"
    });
    await bundle.close();

    console.log(chalk.green(`Built ${config.name} v${config.version} to "${outFile}"`));
}

interface Meta extends Config {
    authorLink?: URL;
    updateUrl?: URL;
    website?: URL;
    source?: URL;
    donate?: URL;
}

async function resolveConfig(input: string): Promise<Meta> {
    const config = JSON.parse(await fs.readFile(path.resolve(input, "config.json"), "utf8")) as Config;
    return {...config};
}

function toMeta(config: Config): string {
    let result = "/**";
    for (const [key, value] of Object.entries(config)) {
        result += `\n * @${key} ${value.replace(/\n/g, "\\n")}`;
    }
    return result + "\n**/\n";
}
