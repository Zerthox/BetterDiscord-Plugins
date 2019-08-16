/**
 * Custom CSS/Sass Importer for Babel
 * @author Zerthox
 */

const fs = require("fs"),
	path = require("path"),
	sass = require("node-sass");

module.exports = function(babel) {
	return {
		name: "sass-importer",
		visitor: {
			CallExpression(nodePath, state) {
				const callee = nodePath.get("callee"),
					args = nodePath.get("arguments");
				if (callee.isIdentifier() && callee.equals("name", "_require") && args.length === 1) {
					const val = args[0].node.value;
					if (val.endsWith(".scss") || val.endsWith(".css")) {
						try {
							const dir = path.dirname(state.file.opts.filename);
							const file = `${state.opts.plugin ? `/*! ${state.opts.plugin.name} styles */\n` : ""}@import "selectors/selectorPlaceholders";\n${fs.readFileSync(path.resolve(dir, val))}`;
							const css = sass.renderSync({
								data: file,
								outputStyle: "expanded",
								includePaths: ["./lib"]
							}).css.toString("utf8");
							nodePath.replaceWithSourceString(`\`${css.endsWith("\n") ? css.slice(0, -1) : css}\``);
						}
						catch (err) {
							console.error(`Error resolving Sass import in "${state.file.opts.filename}":\n    ${err}`);
						}
					}
				}
			}
		}
	};
};