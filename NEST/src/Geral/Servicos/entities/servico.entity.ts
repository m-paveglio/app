import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Servicos')
export class Servicos {
  @PrimaryGeneratedColumn()
  COD_SERVICO: string;
  
  @Column ({ type: 'text', length: 14, nullable: true })
  CNPJ: string;

  @Column({ length: 255, nullable: false })
  DESC_SERVICO: string;

  @Column('decimal', { precision: 10, scale: 2 })
  VALOR: number;

  @Column({ length: 20, nullable: false })
  CNAE: string;

  @Column({ length: 50, nullable: false })
  ITEM_LC: string;

  @Column({ length: 255, nullable: false })
  ATIVIDADE_MUNICIPIO: string;
}