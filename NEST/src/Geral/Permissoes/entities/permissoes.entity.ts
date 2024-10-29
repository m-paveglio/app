import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PERMISSOES')
export class Permissoes {
  @PrimaryGeneratedColumn()
  COD_PERMISSAO: string;

  @Column({ type: 'varchar', length: 50 })
  DESC_PERMISSAO: string
}