import { ExperimentEntity } from 'src/experiment/entities/experiment.entity';
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';


@Entity('word')
export class WordEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({type: 'json', nullable: true})
    result: object;

    @ManyToOne(() => ExperimentEntity, experiment => experiment.words)
    experiment: ExperimentEntity;
}
