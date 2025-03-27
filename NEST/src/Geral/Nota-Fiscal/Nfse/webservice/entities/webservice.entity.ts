import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('WEBSERVICE')
export class Webservice {
  @PrimaryGeneratedColumn()
  ID: number

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  NOME_CIDADE: string;

  @Column({ type: 'nvarchar', length: 300, nullable: true  })
  LINK: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  SERIE_RPS: string;

}