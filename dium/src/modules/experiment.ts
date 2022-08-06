/** An experiment. */
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
