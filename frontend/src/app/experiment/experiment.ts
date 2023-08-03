export interface Experiment {
    id: number;
    name: string;
    model: string;
    version: string;
    program: string;
    status: number;
    configuration: object;
}

export enum ExperimentStatus {
    "stopped" = 0,
    "running" = 1,
    "error" = 2,
}

