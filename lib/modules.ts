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

const Modules = {
    require: webpackRequire,
    byId: (id: number) => webpackRequire.c[id] || null
};

export default Modules;

export type Modules = typeof Modules;
