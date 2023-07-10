export class CreateExperimentDto {
  name: string;
  coniguration: ExperimentConfiguration;
}

abstract class ExperimentConfiguration {
  model: string;
}

class OpenAIConfiguration extends ExperimentConfiguration {
  temperature: number;
}
