import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('PAIS')
export class PaisEntity {

  @PrimaryColumn({ type: 'varchar'})
  ID_PAIS: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  NOME_PAIS: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  COD_PAIS_BACEN: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  COD_PAIS_ISO2: string;
}
