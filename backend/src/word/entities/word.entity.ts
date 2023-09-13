import { ExperimentEntity } from 'src/experiment/entities/experiment.entity';
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique} from 'typeorm';


@Entity('word')
@Unique(['name', 'experiment'])
export class WordEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({type: 'json', nullable: true})
    result: object;

    @ManyToOne(() => ExperimentEntity, experiment => experiment.words, {onDelete: 'CASCADE'})
    experiment: ExperimentEntity;
}
