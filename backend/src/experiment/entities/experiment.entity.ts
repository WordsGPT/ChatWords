import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

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

    @Column({type: 'json', nullable: true})
    configuration: object

}
