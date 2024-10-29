import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('LOGRADOURO')
export class Logradouro {
  @PrimaryColumn({ type: 'varchar',  length: 500 })
  COD_LOGRADOURO: string;

  @Column('varchar', { length: 500 })
  COD_CIDADE: string;

  @Column('varchar', { length: 500 })
  NOME_DO_LOGRADOURO: string;

  @Column('varchar', { length: 500 })
  CEP: string;

  @Column('varchar', { length: 500 })
  BAIRRO: string;

  @Column('varchar', { length: 500 })
  DISTRITO: string;

  @Column('varchar', { length: 500 })
  ATE: string;

  @Column('varchar', { length: 500 })
  DE: string;

  @Column('varchar', { length: 500 })
  LADO: string;

  @Column('varchar', { length: 500 })
  CAD_USUARIO: string;

  @Column('varchar', { length: 500 })
  NOME_FONETIZADO: string;

  @Column('varchar', { length: 500 })
  BAIRRO_FONETIZADO: string;

  @Column('varchar', { length: 500 })
  COD_LOGRADOURO_ECT: string;

  @Column('varchar', { length: 500 })
  COD_CAIXA_POSTAL_ECT: string;

  @Column('varchar', { length: 500 })
  COD_UNIDADE_OPER_ECT: string;

  @Column('varchar', { length: 500 })
  COD_GRANDE_USUARIO_ECT: string;

  @Column('varchar', { length: 500 })
  VISIVEL: string;

  @Column('varchar', { length: 500 })
  LATITUDE: string;

  @Column('varchar', { length: 500 })
  LONGITUDE: string;

  @Column('varchar', { length: 500 })
  ALTITUDE: string;
}
