import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cnae {
    @PrimaryGeneratedColumn()
    COD_CNAE: string;
  
    @Column({ type: 'varchar', length: 2000 })
    DESC_CNAE: string
}
