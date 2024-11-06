import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('USER_EMPRESAS')
export class UserEmpresa {
  @PrimaryColumn({ type: 'text', length: 14 })
  CNPJ: string;

  @PrimaryColumn({ type: 'text', length: 11 })
  CPF: string;

  @Column({ type: 'text' })
  COD_PERMISSAO: string;
}