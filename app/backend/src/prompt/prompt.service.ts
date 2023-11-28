import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { PromptEntity } from './entities/prompt.entity';
import { Not, Repository, IsNull, In } from 'typeorm';


@Injectable()
export class PromptService {
    constructor(
        @InjectRepository(PromptEntity)
        private readonly promptRepository: Repository<PromptEntity>,
    ) {}

    async create(createPromptDto: CreatePromptDto): Promise<PromptEntity> {
        let prompt = new PromptEntity();
        prompt.content = createPromptDto.content;
        const newPrompt = await this.promptRepository.save(prompt);
        return newPrompt;
    }

    findAll() {
        return this.promptRepository.find({take: 100});
    }

    findOne(id: number) {
        return this.promptRepository.findOneBy({id});
    }

    async removeMany(ids: string[]) {
        const entities = await this.promptRepository.findBy({ id: In(ids) })
        if (!entities) {
          throw new NotFoundException(`Some Entities not found, no changes applied!`);
        }
        return this.promptRepository.remove(entities);
      }
}

