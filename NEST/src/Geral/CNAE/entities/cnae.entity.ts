import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('CNAE')
export class CNAE {
  @PrimaryGeneratedColumn()
  COD_CNAE: string;

  @Column({ length: 500, nullable: false })
  DESC_CNAE: string;
}