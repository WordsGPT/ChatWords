export class CreateExperimentDto {
  name: string;
  model: string;
  program: string;
  status: number;
  configuration: ExperimentConfiguration;
  promptsIds: number[];
}

class ExperimentConfiguration {
  model: object;
}
