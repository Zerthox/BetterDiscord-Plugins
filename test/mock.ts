import {Require} from "../discordium/finder";

global.TESTING = true;

const mockRequire: Require = () => null;
mockRequire.m = {};
mockRequire.c = {};

global.webpackJsonp = {
    push([, modules]: [any, Record<string, any>, any]) {
        for (const func of Object.values(modules)) {
            func({}, {}, mockRequire);
        }
    }
};
