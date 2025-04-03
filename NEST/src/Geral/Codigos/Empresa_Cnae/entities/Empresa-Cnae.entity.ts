import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('Empresa_CNAE')
export class Empresa_CNAE {
  @PrimaryColumn({ type: 'text', length: 14})
  CNPJ: string;

  @PrimaryColumn()
  COD_CNAE: string;
}