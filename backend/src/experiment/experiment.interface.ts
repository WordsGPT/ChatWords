export interface Experiment {
    name: string;
    coniguration: ExperimentConfiguration;
}

export interface ExperimentConfiguration {
    model: string;
}