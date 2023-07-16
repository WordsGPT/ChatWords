export class CreateExperimentDto {
  name: string;
  model: string;
  version: string;
  program: string;
  configuration: ExperimentConfiguration;
}

class ExperimentConfiguration {
  model: object;
}
