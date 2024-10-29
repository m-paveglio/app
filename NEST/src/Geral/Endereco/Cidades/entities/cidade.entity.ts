import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('CIDADES')
export class Cidades {
  @PrimaryGeneratedColumn()
  COD_CIDADE: string

  @Column({ type: 'nvarchar', length: 50 })
  NOME_CIDADE: string;

  @Column({ type: 'nvarchar', length: 50 })
  COD_UF: string;

  @Column()
  DDD: number;

  @Column()
  ID_PAIS: number;

  @Column()
  COD_MUNIC_SIAFI: number;

  @Column()
  COD_MUNICIPIO_IBGE: number;

  @Column()
  CEP_UNICO: number;

  @Column()
  COD_CIDADE_ECT: number;

  @Column()
  LATITUDE: string;

  @Column({ type: 'nvarchar', length: 50 })
  VISIVEL: string;

  @Column()
  LONGITUDE: string;

  @Column()
  COD_IBGE: string;

  @Column()
  ALTITUDE: string;

}