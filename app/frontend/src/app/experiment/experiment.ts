export interface Experiment {
    id: number;
    name: string;
    model: string;
    program: string;
    status: number;
    configuration: object;
    prompts: Prompt[];
    promptsIds: number[];
}

export enum ExperimentStatus {
    "stopped" = 0,
    "running" = 1,
    "error" = 2,
    "finished" = 3,
}

export interface Prompt {
    id: number;
    content: string;
}

export interface IAs {
    models: {};
}

export interface Models {
    models: string[];
}
