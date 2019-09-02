const pkg = require("./package.json"),
	fs = require("fs")
	path = require("path"),
	minimist = require("minimist"),
	chalk = require("chalk"),
	babel = require("@babel/core"),
	prettier = require("prettier");

// save cwd
const cwd = process.cwd();

// parse args
const argv = minimist(process.argv);

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
	const dir = path.resolve(cwd, "src", data.version);
	const folders = fs.readdirSync(dir, {withFileTypes: true}).filter((e) => e.isDirectory());
	for (const folder of folders) {
		data.plugins.push(folder.name);
	}
}

// check if development mode
if (data.dev) {
	if (data.plugins.length > 1) {
		console.log(chalk.red("Error: More than 1 Plugin passed in Dev mode."));
	}
	else {
		dev(Object.assign({name: data.plugins[0], watch: true}, data));
	}
}
else {
	for (const plugin of data.plugins) {
		build(Object.assign({name: plugin}, data));
	}
	if (data.devBuild) {
		for (const plugin of data.plugins) {
			dev(Object.assign({name: plugin, watch: false}, data));
		}
	}
}

async function build(data) {
	try {
		const time = process.hrtime();

		// resolve source directory
		const dir = path.resolve(cwd, "src", data.version, data.name);

		// load plugin config
		const info = require(path.resolve(dir, "config.json"));

		// generate source link
		info.source = "https://github.com/Zerthox/BetterDiscord-Plugins";

		// find main file
		const main = path.resolve(dir, "main.jsx");

		// transform with babel & custom sass-importer plugin
		const transformed = babel.transformFileSync(
			main, 
			{
				plugins: [
					["./lib/sass-importer", {
						plugin: info
					}]
				],
				comments: false
			}
		).code;

		// prepend meta & base
		const result = generateMeta(info) + "\n\n" + wrapWScript(generatePlugin(info, transformed));

		// load prettier config
		const cfg = await prettier.resolveConfig(path.resolve(dir));

		// format code
		const formatted = prettier.format(result, cfg);

		// determine output file
		const out = path.resolve(cwd, data.version, `${data.name}.plugin.js`);

		// save result
		fs.writeFileSync(out, formatted);

		// console output
		console.log(chalk.green(`Successfully compiled ${info.name}${info.version ? ` v${info.version}` : ""} to "${out}" [${Math.round(process.hrtime(time)[1] / 1000000)}ms]`));
	}
	catch (err) {
		console.log(chalk.red(`${err.name ? err.name : "Error"} during build:`), err.message);
	}
}

function generateMeta(info) {
	let meta = "/**";
	for (const [key, val] of Object.entries(info)) {
		meta += `\n * @${key} ${val.replace(/\n/g, "\\n")}`;
	}
	return meta + "\n */";
}

function generatePlugin(info, contents) {
	let plugin = fs.readFileSync("./lib/template/base.js", "utf8");
	for (const [key, val] of Object.entries(info)) {
		plugin = plugin.split(`@meta{${key}}`).join(val.replace(/\n/g, "\\n"));
	}
	plugin = plugin.replace(/^"contents";$/gm, contents);
	return babel.transformSync(plugin, Object.assign({comments: false}, pkg.babel)).code;
}

function wrapWScript(contents) {
	const wscript = fs.readFileSync("./lib/template/wscript.js", "utf8");
	return wscript.replace(/^"contents";$/gm, contents);
}

function dev(data) {

	// resolve source directory
	const dir = path.resolve(cwd, "src", data.version, data.name);

	// find main file & config
	const file = path.resolve(dir, "main.jsx"),
		cfg = path.resolve(dir, "config.json");

	// resolve betterdiscord path
	const bdPath = path.resolve(
		process.platform === "win32" ? process.env.APPDATA : process.platform === "darwin" ? path.resolve(process.env.HOME, "Library/Preferences") : path.resolve(process.env.HOME, ".config"),
		"BetterDiscord"
	);

	// find output file path
	const out = path.resolve(bdPath, "plugins", `${data.name}.plugin.js`);

	// declare compile function
	function compile() {
		try {
			const time = process.hrtime();

			// load plugin config
			const info = require(cfg);

			// generate source link
			info.source = "https://github.com/Zerthox/BetterDiscord-Plugins";

			// transform file
			const transformed = babel.transformFileSync(
				file, 
				{
					plugins: [
						["./lib/sass-importer", {
							plugin: info
						}]
					]
				}
			).code;

			// write to output file
			fs.writeFileSync(out, generateMeta(info) + generatePlugin(info, transformed));

			// console output
			console.log(chalk.green(`Compiled "${data.name}.plugin.js" to the BetterDiscord plugins folder [${Math.round(process.hrtime(time)[1] / 1000000)}ms]`));
		}
		catch (err) {

			// log error
			console.log(chalk.red(`${err.name ? err.name : "Error"} during compile:`), err.message);
		}
	};

	// compile once
	compile();

	// watch for changes if necessary
	if (data.watch) {
		console.log(`Watching for changes in "${file}"`);
		fs.watch(dir, {}, (event, filename) => {
			console.log(`=> ${event === "rename" ? "Renamed" : "Changed"} "${filename}"`);
			compile();
		});
	}
}