import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class cep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double' })
  COD_CIDADE: number;

  @Column({ length: 150 })
  NOME_CIDADE: string;

  @Column({ length: 10 })
  COD_UF: string;

  @Column({ length: 10 })
  DDD: string;

  @Column({ type: 'double' })
  ID_PAIS: number;

  @Column({ type: 'double' })
  COD_MUNIC_SIAFI: number;

  @Column({ type: 'double' })
  COD_MUNICIPIO_IBGE: number;

  @Column({ length: 10 })
  CEP_UNICO: string;

  @Column({ type: 'double' })
  COD_CIDADE_ECT: number;

  @Column({ type: 'double' })
  LONGITUDE: number;

  @Column({ type: 'double' })
  LATITUDE: number;

  @Column({ length: 10 })
  VISIVEL: string;

  @Column({ length: 10 })
  COD_IBGE: string;

  @Column({ type: 'double' })
  ALTITUDE: number;
}