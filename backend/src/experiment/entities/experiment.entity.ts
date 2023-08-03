import { WordEntity } from 'src/word/entities/word.entity';
import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';

@Entity('experiment')
export class ExperimentEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    model: string;

    @Column()
    version: string;

    @Column()
    program: string;

    @Column({default: 0})
    status: number;

    @Column({type: 'json', nullable: true})
    configuration: object;

    @OneToMany(() => WordEntity, word => word.experiment)
    words: WordEntity[];

}
