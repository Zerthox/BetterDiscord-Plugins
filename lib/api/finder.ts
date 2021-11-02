// grab webpack require then cleanup
let webpackRequire;
global.webpackJsonp.push([
    [],
    {
        __temp__: (_module: any, _exports: any, require: any) => {
            webpackRequire = require;
        }
    },
    [["__temp__"]]
]);
delete webpackRequire.m.__temp__;
delete webpackRequire.c.__temp__;

export interface Finder {
    require: (id: number) => any;
    byId: (id: number) => any;
}

export default {
    require: webpackRequire,
    byId: (id: number) => webpackRequire.c[id] || null
} as Finder;
