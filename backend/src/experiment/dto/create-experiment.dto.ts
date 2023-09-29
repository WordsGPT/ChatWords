export class CreateExperimentDto {
  name: string;
  model: string;
  version: string;
  program: string;
  status: number;
  configuration: ExperimentConfiguration;
}

class ExperimentConfiguration {
  model: object;
}
