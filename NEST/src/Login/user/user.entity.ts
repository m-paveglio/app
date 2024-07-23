import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class  user {

  @PrimaryColumn({ length: 11, unique: true })
  CPF: string;

  @Column({ type: 'varchar', length: 100 })
  NOME: string;

  @Column({ length: 100 })
  EMAIL: string;

  @Column({ length: 255 })
  SENHA: string;

  @Column({ length: 2 })
  USER_SIS: string;

  @Column({ length: 2 })
  COD_PERMISSAO: string;
  
}
