import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToMany } from 'typeorm';
import { Cidades } from '../../Cidades/entities/cidade.entity';


@Entity('UF')
export class UfEntity {
  
  @PrimaryColumn({ type: 'varchar', length: 10})
  COD_UF: string;

  @OneToMany(() => Cidades, (cidade) => cidade.COD_UF) // Relacionamento com Cidades
  cidades: Cidades[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  NOME_DA_UF: string;

  @Column({ type: 'float', nullable: true })
  COD_UF_IBGE: number;
}
