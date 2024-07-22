import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('UF')
export class UfEntity {
  
  @PrimaryColumn({ type: 'varchar', length: 10})
  COD_UF: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  NOME_DA_UF: string;

  @Column({ type: 'float', nullable: false })
  COD_UF_IBGE: number;
}
