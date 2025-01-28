import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cidades } from '../../Cidades/entities/cidade.entity';

@Entity('LOGRADOURO')
export class Logradouro {
  @PrimaryColumn({ type: 'varchar',  length: 500 })
  COD_LOGRADOURO: string;

  @ManyToOne(() => Cidades, (cidade) => cidade.COD_CIDADE) // Define a relação com a entidade Cidade
  @JoinColumn({ name: 'COD_CIDADE' }) // Conecta à coluna COD_CIDADE na tabela Cidade
  cidade: Cidades;

  @Column('varchar', { length: 500 })
  NOME_DO_LOGRADOURO: string;

  @Column('varchar', { length: 500 })
  CEP: string;

  @Column('varchar', { length: 500, nullable: true })
  BAIRRO: string;

  @Column('varchar', { length: 500, nullable: true })
  DISTRITO: string;

  @Column('varchar', { length: 500, nullable: true })
  ATE: string;

  @Column('varchar', { length: 500, nullable: true })
  DE: string;

  @Column('varchar', { length: 500, nullable: true })
  LADO: string;

  @Column('varchar', { length: 500, nullable: true })
  CAD_USUARIO: string;

  @Column('varchar', { length: 500, nullable: true })
  NOME_FONETIZADO: string;

  @Column('varchar', { length: 500, nullable: true })
  BAIRRO_FONETIZADO: string;

  @Column('varchar', { length: 500, nullable: true })
  COD_LOGRADOURO_ECT: string;

  @Column('varchar', { length: 500, nullable: true })
  COD_CAIXA_POSTAL_ECT: string;

  @Column('varchar', { length: 500, nullable: true })
  COD_UNIDADE_OPER_ECT: string;

  @Column('varchar', { length: 500, nullable: true })
  COD_GRANDE_USUARIO_ECT: string;

  @Column('varchar', { length: 500, nullable: true })
  VISIVEL: string;

  @Column('varchar', { length: 500, nullable: true })
  LATITUDE: string;

  @Column('varchar', { length: 500, nullable: true })
  LONGITUDE: string;

  @Column('varchar', { length: 500, nullable: true })
  ALTITUDE: string;
}
