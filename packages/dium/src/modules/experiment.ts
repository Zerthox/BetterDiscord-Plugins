import { Finder } from "../api";
import type { Snowflake } from ".";
import type { Store } from "./flux";

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
    type: ExperimentType;
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

export const enum ExperimentType {
    GUILD = "guild",
    NONE_LEGACY = "none",
    USER = "user",
}

export const enum ExperimentExposureType {
    AUTO = "auto",
    MANUAL = "manual",
}

export const enum ExperimentTreatment {
    NOT_ELIGIBLE = -1,
    CONTROL = 0,
    TREATMENT_1 = 1,
    TREATMENT_2 = 2,
    TREATMENT_3 = 3,
    TREATMENT_4 = 4,
    TREATMENT_5 = 5,
    TREATMENT_6 = 6,
    TREATMENT_7 = 7,
    TREATMENT_8 = 8,
    TREATMENT_9 = 9,
    TREATMENT_10 = 10,
    TREATMENT_11 = 11,
    TREATMENT_12 = 12,
    TREATMENT_13 = 13,
    TREATMENT_14 = 14,
    TREATMENT_15 = 15,
    TREATMENT_16 = 16,
    TREATMENT_17 = 17,
    TREATMENT_18 = 18,
    TREATMENT_19 = 19,
    TREATMENT_20 = 20,
    TREATMENT_21 = 21,
    TREATMENT_22 = 22,
    TREATMENT_23 = 23,
    TREATMENT_24 = 24,
    TREATMENT_25 = 25,
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
