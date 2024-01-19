export class CreateWordDto {
  name: string;
  result: object;
  experimentId: number;
}

export class ProxyResult {
  question: string;
  answer: string;
}