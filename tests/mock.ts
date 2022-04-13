import {Require} from "dium/api/finder";

global.TESTING = true;

const mockRequire: Partial<Require> = () => null;
mockRequire.m = {};
mockRequire.c = {};

global.webpackJsonp = {
    push([, modules]: [any, Record<string, any>, any]) {
        for (const func of Object.values(modules)) {
            func({}, {}, mockRequire);
        }
    }
};

global.BdApi = {
    findModule: () => null,
    findAllModules: () => []
} as any;
