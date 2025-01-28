import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('PESSOAS')
export class pessoas {
  @PrimaryColumn({ length: 14, unique: true })
  CPF_CNPJ: string;

  @Column({ type: 'varchar', length: 100 })
  NOME: string;

  @Column({ length: 100 })
  EMAIL: string;

  @Column({ length: 2 })
  DDD: string;

  @Column({ length: 15 })
  TELEFONE_CELULAR: string;

  @Column({ length: 10 })
  CEP: string;

  @Column({ length: 100 })
  RUA_LOGRADOURO: string;
  
  @Column({ length: 10 })
  NUMERO_LOGRADOURO: string;

  @Column({ length: 100 })
  BAIRRO_LOGRADOURO: string;

  @Column({ length: 100 })
  COMPLEMENTO_LOGRADOURO: string;

  @Column({ length: 100 })
  COD_CIDADE: string;

  @Column({ length: 2 })
  UF: string;
}
