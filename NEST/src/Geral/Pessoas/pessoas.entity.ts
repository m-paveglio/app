import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PESSOAS')
export class pessoas {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({ length: 14, unique: true })
  CPF: string;

  @Column({ type: 'varchar', length: 100 })
  NOME: string;

  @Column({ length: 100 })
  EMAIL: string;

  @Column({ length: 2 })
  DDD: string;

  @Column({ length: 15 })
  TELEFONE_CELULAR: string;
  
  @Column({ length: 2 })
  COD_CARGO: string;

  @Column({ length: 15 })
  DT_NASCIMENTO: string;

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
  CIDADE: string;

  @Column({ length: 2 })
  UF: string;
}
