import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('CodigoTributacaoMunicipio')
export class CodigoTributacaoMunicipio {
  @PrimaryColumn({ type: 'text', length: 14})
  CNPJ: string;
  
  @PrimaryColumn()
  COD_ATIVIDADE: string;

  @Column({ length: 255, nullable: false })
  DESC_ATIVIDADE: string;
}