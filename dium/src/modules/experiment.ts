import {Finder} from "../api";
import type {Snowflake, Store} from ".";

export interface Experiment<Config = Record<string, any>> {
    definition: {
        id: string;
        kind: string;
        label: string;
        defaultConfig: Config;
        treatments: Config[];
    };

    getCurrentConfig(t: any, n: any): Config;
    useExperiment(t: any, n: any): Config;
    subscribe(t: any, n: any, r: any): any;
    trackExposure(t: any, r: any): any;
}

export interface ExperimentInfo {
    type: "user" | "guild";
    title: string;
    description: string[];
    buckets: number[];
    clientFilter?: any;
}

export interface UserExperimentDescriptor {
    type: "user";
    bucket: number;
    override: boolean;
    population: number;
    revision: number;
}

export type GuildExperimentDescriptor = Record<string, any>;

export interface ExperimentStore extends Store {
    get hasLoadedExperiments(): boolean;

    getExperimentOverrideDescriptor(experiment: string): any;
    getAllExperimentOverrideDescriptors(): Record<string, any>;

    getAllUserExperimentDescriptors(): Record<number, UserExperimentDescriptor>;
    getUserExperimentDescriptor(experiment: string): UserExperimentDescriptor;
    getUserExperimentBucket(experiment: string): number;

    getGuildExperiments(): Record<number, GuildExperimentDescriptor>;
    getGuildExperimentDescriptor(experiment: string, guild: Snowflake): GuildExperimentDescriptor;
    getGuildExperimentBucket(experiment: string, guild: Snowflake): number;

    getRegisteredExperiments(): Record<string, ExperimentInfo>;
    getSerializedState(): any;
    hasRegisteredExperiment(experiment: string): boolean;
    isEligibleForExperiment(experiment: string, guild?: Snowflake): boolean;

    __getLocalVars(): any;
}

export const ExperimentStore: ExperimentStore = /* @__PURE__ */ Finder.byName("ExperimentStore");
