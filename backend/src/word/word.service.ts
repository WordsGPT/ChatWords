import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { WordEntity } from './entities/word.entity';
import { Repository } from 'typeorm';
import { ExperimentEntity } from 'src/experiment/entities/experiment.entity';

@Injectable()
export class WordService {
  constructor(
    @InjectRepository(WordEntity)
    private readonly wordRepository: Repository<WordEntity>,
    @InjectRepository(ExperimentEntity)
    private readonly experimentRepository: Repository<ExperimentEntity>

  ) {}


  async create(createWordDto: CreateWordDto): Promise<WordEntity> {
    let word = new WordEntity();
    word.name = createWordDto.name;
    word.result = createWordDto.result;
    const experiment = await this.experimentRepository.findOneBy({id: createWordDto.experimentId});
    word.experiment = experiment;
    const newWord = await this.wordRepository.save(word); 
    return newWord;
  }

  async createWords(createWordsDto: CreateWordDto[]) {
    const newWords = createWordsDto.map(createWordDto => {
      return {
        name: createWordDto.name,
        result: createWordDto.result,
        experiment: {id: createWordDto.experimentId}
      }
    })
    const result = await this.wordRepository
    .createQueryBuilder()
    .insert()
    .values(newWords)
    .execute()
    const words = []
    for (let i = 0; i < newWords.length; i ++){
      words.push({
        name: newWords[i].name, 
        result: newWords[i].result,
        id: result.identifiers[i].id
      })
    }
    return words;
  }

  findAll() {
    return this.wordRepository.find();
  }

  findAllFromExperiment(experimentId: number) {
    return this.wordRepository.find({where: { experiment: { id: experimentId }}})
  }

  findOne(id: number) {
    return this.wordRepository.findOne({where: {id:id} ,relations:['experiment']});
  }

  update(id: number, updateWordDto: UpdateWordDto) {
    return this.wordRepository.update(id, updateWordDto);
  }

  async remove(id: number) {
    return await this.wordRepository.delete(id);
  }
}
