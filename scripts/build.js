const pkg = require("../package.json");
const fs = require("fs");
const path = require("path");
const minimist = require("minimist");
const chalk = require("chalk");
const babel = require("@babel/core");
const prettier = require("prettier");

const repo = "Zerthox/BetterDiscord-Plugins";
const authorLinks = {
    Zerthox: "https://github.com/Zerthox"
};
const donateLink = "https://paypal.me/zerthox";

// save cwd
const cwd = path.join(__dirname, "..");

// parse args
const argv = minimist(process.argv);

// resolve sass importer for babel
const sassImporter = path.join(cwd, "src/lib/sass-importer");

// check if plugins passed
if (!argv.plugin && !argv.plugins) {
    console.log(chalk.red("Error: No Plugins passed in the \"--plugin\" and \"--plugins\" flags."));
    return;
}

// save data
const data = {
    plugins: (argv.plugins || argv.plugin).split(","),
    version: argv.version || "v1",
    dev: argv.develop || argv.dev || false,
    devBuild: argv.devBuild || argv.devbuild || argv["dev-build"] || false
};

// check if all plugins
if (data.plugins[0] === "*") {
    data.plugins = [];
    const dir = path.join(cwd, "src", data.version);
    const folders = fs.readdirSync(dir, {withFileTypes: true}).filter((entry) => entry.isDirectory());
    for (const folder of folders) {
        data.plugins.push(folder.name);
    }
}

// check if development mode
if (data.dev) {
    if (data.plugins.length > 1) {
        console.log(chalk.red("Error: More than 1 Plugin passed in Dev mode."));
    } else {
        dev({name: data.plugins[0], watch: true, ...data});
    }
} else {
    for (const plugin of data.plugins) {
        build({name: plugin, ...data});
    }
    if (data.devBuild) {
        for (const plugin of data.plugins) {
            dev({name: plugin, watch: false, ...data});
        }
    }
}

async function build(data) {
    try {
        const time = process.hrtime();

        // resolve source directory
        const dir = path.join(cwd, "src", data.version, data.name);

        // load plugin config
        const info = require(path.join(dir, "config.json"));

        // find main file
        const main = path.join(dir, "main.jsx");

        // transform with babel & custom sass-importer plugin
        const transformed = babel.transformFileSync(main, {
            plugins: [
                [sassImporter, {plugin: info}]
            ],
            comments: false
        }).code;

        // prepend meta & base
        const result = generateMeta(data, info) + "\n\n" + wrapWScript(generatePlugin(info, transformed));

        // load prettier config
        const cfg = await prettier.resolveConfig(path.join(dir));

        // format code
        const formatted = prettier.format(result, cfg);

        // determine output file
        const out = path.join(cwd, data.version, `${data.name}.plugin.js`);

        // save result
        fs.writeFileSync(out, formatted);

        // console output
        console.log(chalk.green(`Compiled ${info.name}${info.version ? ` v${info.version}` : ""} to: "${out}" [${Math.round(process.hrtime(time)[1] / 1000000)}ms]`));
    } catch (err) {
        console.log(chalk.red(`${err.name ? err.name : "Error"} during build:`), err.message);
    }
}

function generateMeta(data, info) {
    // default meta info
    const meta = {
        ...info,
        authorLink: authorLinks[info.author],
        donate: donateLink,
        website: `https://github.com/${repo}`,
        source: `https://github.com/${repo}/blob/master/${data.version}/${data.name}.plugin.js`,
        updateUrl: `https://raw.githubusercontent.com/${repo}/master/${data.version}/${data.name}.plugin.js`
    };

    // generate code
    let code = "/**";
    for (const [key, val] of Object.entries(meta)) {
        code += `\n * @${key} ${val.replace(/\n/g, "\\n")}`;
    }
    return code + "\n */";
}

function generatePlugin(info, contents) {
    let plugin = fs.readFileSync(path.join(cwd, "src/lib/template/base.js"), "utf8");
    for (const [key, val] of Object.entries(info)) {
        plugin = plugin.split(`@meta{${key}}`).join(val.replace(/\n/g, "\\n"));
    }
    plugin = plugin.replace(/^"contents";$/gm, contents);
    return babel.transformSync(plugin, Object.assign({comments: false}, pkg.babel)).code;
}

function wrapWScript(contents) {
    const wscript = fs.readFileSync(path.join(cwd, "src/lib/template/wscript.js"), "utf8");
    return wscript.replace(/^"contents";$/gm, contents);
}

function dev(data) {
    // resolve source directory
    const dir = path.join(cwd, "src", data.version, data.name);

    // find main file & config
    const file = path.join(dir, "main.jsx");
    const cfg = path.join(dir, "config.json");

    // resolve betterdiscord path
    const bdPath = path.join(
        process.platform === "win32" ? process.env.APPDATA : process.platform === "darwin" ? path.join(process.env.HOME, "Library/Preferences") : path.join(process.env.HOME, ".config"),
        "BetterDiscord"
    );

    // find output file path
    const out = path.join(bdPath, "plugins", `${data.name}.plugin.js`);

    // declare compile function
    function compile() {
        try {
            const time = process.hrtime();

            // load plugin config
            const info = JSON.parse(fs.readFileSync(cfg, "utf8"));

            // transform file
            const transformed = babel.transformFileSync(file, {
                plugins: [
                    [sassImporter, {plugin: info}]
                ]
            }).code;

            // write to output file
            fs.writeFileSync(out, generateMeta(data, info) + generatePlugin(info, transformed));

            // console output
            console.log(chalk.green(`Compiled "${info.name}.plugin.js" to the BetterDiscord plugins folder [${Math.round(process.hrtime(time)[1] / 1000000)}ms]`));
        } catch (err) {
            console.log(chalk.red(`${err.name ? err.name : "Error"} during compile:`), err.message);
        }
    }

    // compile once
    compile();

    // watch for changes if necessary
    if (data.watch) {
        // watch plugin dir
        console.log(`Watching for changes in "${dir}"`);
        fs.watch(dir, {}, (event, filename) => {
            console.log(`=> ${event === "rename" ? "Renamed" : "Changed"} "${filename}"`);
            compile();
        });

        // watch template
        fs.watch(path.join(__dirname, "../src/lib/template"), {}, (event, filename) => {
            console.log(`=> ${event === "rename" ? "Renamed" : "Changed"} "${filename}"`);
            compile();
        });
    }
}
