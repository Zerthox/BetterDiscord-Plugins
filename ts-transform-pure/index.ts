import * as ts from "typescript";

export default {
    type: "program",
    factory: (program: ts.Program) => {
        const typeChecker = program.getTypeChecker();
        const pure = new Set<ts.Symbol>();

        const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                // check for declarations & calls
                if (
                    ts.isVariableDeclaration(node)
                    || ts.isFunctionDeclaration(node)
                    || ts.isPropertyDeclaration(node)
                    || ts.isExportDeclaration(node)
                ) {
                    const tags = ts.getJSDocTags(node);

                    // save symbols annotated with pure
                    if (tags.some((tag) => tag.tagName.text === "pure")) {
                        const symbol = typeChecker.getSymbolAtLocation(node.name);
                        if (symbol) {
                            pure.add(symbol);
                        }
                    }
                } else if (ts.isCallExpression(node)) {
                    const target = typeChecker.getSymbolAtLocation(node.expression);

                    // annotate pure target
                    if (pure.has(target)) {
                        ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, "@__PURE__");
                    }
                }
                return ts.visitEachChild(node, visitor, context);
            };

            return (sourceFile) => ts.visitNode(sourceFile, visitor);
        };

        return transformer;
    }
} as const;
