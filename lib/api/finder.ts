// grab webpack require then cleanup
const webpackRequire = global.webpackJsonp.push([
    [],
    {
        __temp__: (module, _, require) => {
            module.exports = require;
        }
    },
    [["__temp__"]]
]);
delete webpackRequire.m.__temp__;
delete webpackRequire.c.__temp__;

export interface Finder {
    byId: (id: number) => any;
}

export default {
    byId: (id: number) => webpackRequire.c[id] || null
} as Finder;
