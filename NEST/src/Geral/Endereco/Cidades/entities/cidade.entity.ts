import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UfEntity } from '../../UF/entities/uf.entity';

@Entity('CIDADES')
export class Cidades {
  @PrimaryGeneratedColumn()
  COD_CIDADE: string

  @Column({ type: 'nvarchar', length: 50 })
  NOME_CIDADE: string;

  @Column({ type: 'nvarchar', length: 50 })
  COD_UF: string;

  @ManyToOne(() => UfEntity, (uf) => uf.COD_UF) // Relação com a tabela UF
  @JoinColumn({ name: 'COD_UF', referencedColumnName: 'COD_UF' }) // Conexão com UF
  uf: UfEntity;

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