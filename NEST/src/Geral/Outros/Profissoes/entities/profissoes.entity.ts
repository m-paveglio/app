import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PROFISSOES')
export class Profissoes {
  @PrimaryGeneratedColumn()
  COD_PROFISSAO: string;

  @Column({ type: 'varchar', length: 50 })
  DESC_PROFISSAO: string
}