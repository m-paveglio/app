import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('WEBSERVICE')
export class Webservice {
  @PrimaryGeneratedColumn()
  ID: string

  @Column({ type: 'nvarchar', length: 50 })
  NOME_CIDADE: string;

  @Column({ type: 'nvarchar', length: 300 })
  LINK: string;

}