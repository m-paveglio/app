import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('Empresa_ITEMLC')
export class Empresa_ITEMLC {
  @PrimaryColumn({ type: 'text', length: 14})
  CNPJ: string;

  @PrimaryColumn()
  COD_ITEM_LC: string;
}