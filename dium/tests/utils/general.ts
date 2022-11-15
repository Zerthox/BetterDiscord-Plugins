import {describe, it} from "mocha";
import {strict as assert} from "assert";

import {mappedProxy} from "../../src/utils";

describe("Utilities", () => {
    describe("mappedProxy", () => {
        const original = {
            a: "foo",
            get b() {
                return [1, 2, 3];
            },
            c: (arg: any) => console.log(arg)
        };
        const mapping = {
            name: "a",
            data: "b",
            log: "c"
        } as const;

        it("maps read", () => {
            const mapped = mappedProxy(original, mapping);

            assert.equal(mapped.a, original.a);
            assert.equal(mapped.name, original.a);
            assert.deepEqual(mapped.b, original.b);
            assert.deepEqual(mapped.data, original.b);
            assert.equal(mapped.c, original.c);
            assert.equal(mapped.log, original.c);
        });

        it("maps keys", () => {
            const mapped = mappedProxy(original, mapping);

            assert("name" in mapped);
            assert("a" in mapped);
            assert.deepEqual(Object.keys(mapped).sort(), [...Object.keys(original), ...Object.keys(mapping)].sort());
        });

        it("maps write", () => {
            const cloned = {...original};
            const mapped = mappedProxy(cloned, mapping);

            assert.doesNotThrow(() => mapped.name = "bar");
            assert.equal(mapped.name, "bar");
            assert.equal(mapped.a, "bar");
            assert.equal(cloned.a, "bar");
        });

        it("maps delete", () => {
            const cloned = {...original};
            const mapped = mappedProxy(cloned, mapping);
            delete mapped.log;

            assert.equal(mapped.log, undefined, "value remained in mapped");
            assert(!("log" in mapped), "key remained in mapped");
            assert.equal(cloned.c, undefined, "value remained in original");
            assert(!("c" in cloned), "key remained in original");
        });

        it("maps descriptor get", () => {
            const mapped = mappedProxy(original, mapping);

            assert.deepEqual(Object.getOwnPropertyDescriptor(mapped, "name"), Object.getOwnPropertyDescriptor(original, "a"));
            assert.deepEqual(Object.getOwnPropertyDescriptor(mapped, "a"), Object.getOwnPropertyDescriptor(original, "a"));
            assert.deepEqual(Object.getOwnPropertyDescriptor(mapped, "data"), Object.getOwnPropertyDescriptor(original, "b"));
            assert.deepEqual(Object.getOwnPropertyDescriptor(mapped, "log"), Object.getOwnPropertyDescriptor(original, "c"));
        });

        it("maps descriptor set", () => {
            const cloned = {...original};
            const mapped = mappedProxy(cloned, mapping);
            Object.defineProperty(mapped, "data", {
                get: () => []
            });

            assert.deepEqual(mapped.data, []);
            assert.deepEqual(cloned.b, []);
        });
    });
});
