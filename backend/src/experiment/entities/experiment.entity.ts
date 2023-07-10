import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity('experiment')
export class Experiment {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({type: 'json'})
    configuration: object

}
