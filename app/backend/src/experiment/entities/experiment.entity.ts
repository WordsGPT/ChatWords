import { WordEntity } from 'src/word/entities/word.entity';
import { PromptEntity } from 'src/prompt/entities/prompt.entity';
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable} from 'typeorm';

@Entity('experiment')
export class ExperimentEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    model: string;

    @Column()
    program: string;

    @Column({default: 0})
    status: number;

    @Column({type: 'json', nullable: true})
    configuration: object;

    @OneToMany(() => WordEntity, word => word.experiment)
    words: WordEntity[];

    @ManyToMany(() => PromptEntity, prompt => prompt.experiments, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinTable({
        name: 'experiment_prompt',
        joinColumn: {
          name: 'experiment_id',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'prompt_id',
          referencedColumnName: 'id',
        },
      })
      prompts?: PromptEntity[];

}
