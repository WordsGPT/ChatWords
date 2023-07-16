export interface Experiment {
    id: number;
    name: string;
    model: string;
    version: string;
    program: string;
    configuration: object;
}