import {describe, it} from "mocha";
import {strict as assert} from "assert";
import "./mock";

import {queryTree, queryTreeAll} from "discordium/utils";

describe("React element tree", () => {
    const tree = {
        key: null,
        props: {
            className: "foo",
            children: [
                {
                    key: 0,
                    props: {
                        children: {
                            key: null,
                            props: {},
                            type: "span"
                        }
                    },
                    type: (props: {children: JSX.Element}) => props.children
                },
                {
                    key: 1,
                    props: {
                        className: "foo",
                        children: {
                            key: null,
                            props: {},
                            type: "text"
                        }
                    },
                    type: "span"
                }
            ]
        },
        type: "div"
    };

    describe("queryTree", () => {
        it("finds a result", () => {
            assert.notEqual(queryTree(tree, (node) => node.type === "span"), null);
        });

        it("finds the correct node", () => {
            assert.equal(queryTree(tree, (node) => node.type === "span"), tree.props.children[1]);
        });
    });

    describe("queryTreeAll", () => {
        it("finds a result", () => {
            assert(queryTreeAll(tree, (node) => node.type === "span").length > 0);
        });

        it("finds the correct nodes", () => {
            assert.deepEqual(
                queryTreeAll(tree, (node) => node.type === "span"),
                [tree.props.children[1], tree.props.children[0].props.children]
            );
        });
    });
});
