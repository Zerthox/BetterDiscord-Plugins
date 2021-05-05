/**
 * Custom CSS/Sass Importer for Babel
 * @author Zerthox
 */

const path = require("path");
const sass = require("sass");

module.exports = () => {
    return {
        name: "sass-importer",
        visitor: {
            CallExpression(nodePath, state) {
                const callee = nodePath.get("callee");
                const args = nodePath.get("arguments");

                // find calls to $include
                if (callee.isIdentifier() && callee.equals("name", "$include") && args.length === 1) {
                    const file = args[0].node.value;

                    // check file extension
                    if (file.endsWith(".scss") || file.endsWith(".css")) {
                        try {
                            // compile sass
                            const css = sass.renderSync({
                                file: path.resolve(path.dirname(state.file.opts.filename), file),
                                outputStyle: "expanded",
                                indentWidth: 4
                            }).css.toString("utf8");

                            // prepend plugin info
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
