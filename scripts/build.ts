import path from "path";
import { readdirSync } from "fs";
import minimist from "minimist";
import chalk from "chalk";
import * as rollup from "rollup";
import styleModules from "rollup-plugin-style-modules";
import { resolvePkg, readMetaFromPkg } from "bd-meta";
import bdMeta from "rollup-plugin-bd-meta";
import bdWScript from "rollup-plugin-bd-wscript";
import rollupConfig from "../rollup.config";
import { repository } from "../package.json";

const success = (msg: string) => console.log(chalk.green(msg));
const warn = (msg: string) => console.warn(chalk.yellow(`Warn: ${msg}`));
const error = (msg: string) => console.error(chalk.red(`Error: ${msg}`));

// find sources
const sourceFolder = path.resolve(__dirname, "../src");
const sourceEntries = readdirSync(sourceFolder, { withFileTypes: true }).filter((entry) => entry.isDirectory());

// parse args
const args = minimist(process.argv.slice(2), { boolean: ["dev", "watch"] });

// resolve input paths
let inputPaths: string[] = [];
if (args._.length === 0) {
    inputPaths = sourceEntries.map((entry) => path.resolve(sourceFolder, entry.name));
} else {
    for (const name of args._) {
        const entry = sourceEntries.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
        if (entry) {
            inputPaths.push(path.resolve(sourceFolder, entry.name));
        } else {
            warn(`Unknown plugin "${name}"`);
        }
    }
}

// check for inputs
if (inputPaths.length === 0) {
    error("No plugin inputs");
    process.exit(1);
}

// resolve output directory
const outDir = args.dev
    ? path.resolve(
          process.platform === "win32"
              ? process.env.APPDATA
              : process.platform === "darwin"
                ? path.resolve(process.env.HOME, "Library/Application Support")
                : path.resolve(process.env.HOME, ".config"),
          "BetterDiscord/plugins",
      )
    : path.resolve(__dirname, "../dist/bd");

const watchers: Record<string, rollup.RollupWatcher> = {};

// build each input
for (const inputPath of inputPaths) {
    const outputPath = path.resolve(outDir, `${path.basename(inputPath)}.plugin.js`);

    if (args.watch) {
        // watch for changes
        watch(inputPath, outputPath).then(() => console.log(`Watching for changes in "${inputPath}"`));
    } else {
        // build once
        build(inputPath, outputPath);
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

async function build(inputPath: string, outputPath: string): Promise<void> {
    const meta = await readMetaFromPkg(await resolvePkg(inputPath));
    const config = generateRollupConfig(meta.name, inputPath, outputPath);

    // bundle plugin
    const bundle = await rollup.rollup(config);
    await bundle.write(config.output);
    success(`Built ${meta.name} v${meta.version} to "${outputPath}"`);

    await bundle.close();
}

async function watch(inputPath: string, outputPath: string): Promise<void> {
    const pkgPath = await resolvePkg(inputPath);
    const meta = await readMetaFromPkg(pkgPath);
    const { plugins, ...config } = generateRollupConfig(meta.name, inputPath, outputPath);

    // start watching
    const watcher = rollup.watch({
        ...config,
        plugins: [
            plugins,
            {
                name: "package-watcher",
                buildStart() {
                    this.addWatchFile(pkgPath);
                },
            },
        ],
    });

    // close finished bundles
    watcher.on("event", (event) => {
        if (event.code === "BUNDLE_END") {
            success(`Built ${meta.name} v${meta.version} to "${outputPath}" [${event.duration}ms]`);
            event.result.close();
        }
    });

    // restart on config changes
    watcher.on("change", (file) => {
        // check for config changes
        if (file === pkgPath) {
            watchers[inputPath].close();
            watch(inputPath, outputPath);
        }

        console.log(`=> Changed "${file}"`);
    });

    watchers[inputPath] = watcher;
}

interface RollupConfig extends Omit<rollup.RollupOptions, "output"> {
    output: rollup.OutputOptions;
}

function generateRollupConfig(name: string, inputPath: string, outputPath: string): RollupConfig {
    const { output, plugins, ...rest } = rollupConfig;

    return {
        ...rest,
        input: path.resolve(inputPath, "index.tsx"),
        plugins: [
            plugins,
            styleModules({
                modules: {
                    generateScopedName: `[local]-${name}`,
                },
                cleanup: true,
            }),
            bdMeta({
                meta: {
                    website: repository,
                    source: `${repository}/tree/master/src/${path.basename(inputPath)}`,
                },
                authorGithub: true,
            }),
            bdWScript(),
        ],
        output: {
            ...output,
            file: outputPath,
        },
    };
}
