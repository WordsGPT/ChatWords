export class CreateExperimentDto {
  name: string;
  model: string;
  version: string;
  configuration: ExperimentConfiguration;
}

class ExperimentConfiguration {
  model: object;
}
