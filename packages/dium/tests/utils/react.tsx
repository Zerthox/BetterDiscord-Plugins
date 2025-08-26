import { describe, it } from "mocha";
import { strict as assert } from "assert";
import React from "react";
import { createFiber } from "../mock";

import { Direction, Predicate, queryFiber, queryTree, queryTreeAll } from "../../src/utils/react";
import type { Fiber } from "../../src/react-internals";

const TestComponent = ({ children }: { children: React.JSX.Element }): React.JSX.Element => children;

const elements = (
    <div className="foo">
        <TestComponent key={0}>
            <span className="bar" />
        </TestComponent>
        <span key={1} className="baz">
            <text />
        </span>
    </div>
);

describe("React element tree", () => {
    const tree = elements;

    describe("queryTree", () => {
        it("finds a result", () => {
            assert(queryTree(tree, (node) => node.type === "span") instanceof Object);
        });

        it("finds the correct node", () => {
            assert.equal(
                queryTree(tree, (node) => node.type === "span"),
                tree.props.children[1],
            );
        });
    });

    describe("queryTreeAll", () => {
        it("finds a result", () => {
            assert(queryTreeAll(tree, (node) => node.type === "span").length > 0);
        });

        it("finds the correct nodes", () => {
            assert.deepEqual(
                queryTreeAll(tree, (node) => node.type === "span"),
                [tree.props.children[1], tree.props.children[0].props.children],
            );
        });
    });
});

describe("React Fiber", () => {
    const root = createFiber(elements);
    const parent = root.child;
    const child = parent.child.child;

    const deepRoot = { key: "0" } as Fiber;
    let deepChild = deepRoot;
    for (let i = 1; i < 100; i++) {
        const child = {
            key: i.toString(),
            return: deepChild,
        } as Fiber;
        deepChild.child = child;
        deepChild = child;
    }

    const createTrackingPredicate = (): [Predicate<Fiber>, Set<number>] => {
        const calledOn = new Set<number>();
        const predicate = (node: Fiber) => {
            calledOn.add(parseInt(node.key));
            return false;
        };
        return [predicate, calledOn];
    };

    describe("queryFiber", () => {
        it("finds a result upwards", () => {
            assert(queryFiber(child, (node) => node.type === "div", Direction.Up) instanceof Object);
        });

        it("finds the correct node upwards", () => {
            assert.equal(
                queryFiber(parent, (node) => node.type === "div", Direction.Up),
                parent,
            );
        });

        it("finds a result downwards", () => {
            assert(queryFiber(parent, (node) => node.type === "span", Direction.Down) instanceof Object);
        });

        it("finds the correct node downwards", () => {
            assert.equal(
                queryFiber(parent, (node) => node.type === "span", Direction.Down),
                child,
            );
        });

        it("stops after max depth upwards", () => {
            const depth = 30;
            const [predicate, calledOn] = createTrackingPredicate();
            queryFiber(deepChild, predicate, Direction.Up);

            const expected = new Set([...Array(depth + 1).keys()].map((i) => 99 - i)); // includes call on node itself
            assert.deepEqual(calledOn, expected);
        });

        it("stops after max depth downwards", () => {
            const depth = 30;
            const [predicate, calledOn] = createTrackingPredicate();
            queryFiber(deepRoot, predicate, Direction.Down);

            const expected = new Set(Array(depth + 1).keys()); // includes call on node itself
            assert.deepEqual(calledOn, expected);
        });
    });
});
