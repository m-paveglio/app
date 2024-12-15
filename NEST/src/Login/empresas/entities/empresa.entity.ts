import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('EMPRESAS')
export class empresa {
  @PrimaryColumn({ type: 'text', length: 14 })
  CNPJ: string;

  @Column({ type: 'text', length: 300 })
  NOME: string;
  
  @Column({ type: 'text', length: 2 })
  OPTANTE_SN: string;
}