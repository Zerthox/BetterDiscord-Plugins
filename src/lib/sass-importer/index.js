/**
 * Custom CSS/Sass Importer for Babel
 * @author Zerthox
 */

const path = require("path");
const sass = require("node-sass");

module.exports = function(babel) {
    return {
        name: "sass-importer",
        visitor: {
            CallExpression(nodePath, state) {
                const callee = nodePath.get("callee");
                const args = nodePath.get("arguments");
                if (callee.isIdentifier() && callee.equals("name", "$include") && args.length === 1) {
                    const val = args[0].node.value;
                    if (val.endsWith(".scss") || val.endsWith(".css")) {
                        try {
                            const dir = path.dirname(state.file.opts.filename);
                            const css = sass.renderSync({
                                file: path.resolve(dir, val),
                                outputStyle: "expanded",
                                includePaths: ["./lib"]
                            }).css.toString("utf8");
                            const {plugin} = state.opts;
                            nodePath.replaceWithSourceString(`\`${plugin ? `/*! ${plugin.name} v${plugin.version} styles */\n` : ""}${css.trim()}\``);
                        } catch (err) {
                            throw Error(`Error resolving Sass import in "${state.file.opts.filename}":\n    ${err}`);
                        }
                    }
                }
            }
        }
    };
};
