import { ExperimentEntity } from 'src/experiment/entities/experiment.entity';
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';


@Entity('word')
export class WordEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({nullable: true})
    result: string;

    @ManyToOne(() => ExperimentEntity, experiment => experiment.words)
    experiment: ExperimentEntity;
}
