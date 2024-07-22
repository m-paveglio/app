import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Nbs {
    @PrimaryGeneratedColumn()
    COD_NBS: string;
  
    @Column({ type: 'varchar', length: 2000 })
    DESC_NBS: string

    @Column({ type: 'varchar', length: 20 })
    MASCARA_NBS: string
}