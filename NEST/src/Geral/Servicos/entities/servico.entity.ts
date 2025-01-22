import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Servicos')
export class Servicos {
  @PrimaryGeneratedColumn()
  COD_SERVICO: string;

  @Column({ length: 255 })
  DESC_SERVICO: string;

  @Column('decimal', { precision: 10, scale: 2 })
  VALOR: number;

  @Column({ length: 20 })
  CNAE: string;

  @Column({ length: 50 })
  ITEM_LC: string;

  @Column({ length: 255 })
  ATIVIDADE_MUNICIPIO: string;
}