import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('CodigoTributacaoMunicipio')
export class CodigoTributacaoMunicipio {
  @PrimaryGeneratedColumn()
  COD_ATIVIDADE: string;

  @Column({ length: 255, nullable: false })
  DESC_ATIVIDADE: string;
}