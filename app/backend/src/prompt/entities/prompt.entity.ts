import { ExperimentEntity } from 'src/experiment/entities/experiment.entity';
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, ManyToMany} from 'typeorm';


@Entity('prompt')
export class PromptEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @ManyToMany(() => ExperimentEntity, experiment => experiment.prompts, {onDelete: 'CASCADE', onUpdate: 'CASCADE',})
      experiments?: ExperimentEntity[];

}