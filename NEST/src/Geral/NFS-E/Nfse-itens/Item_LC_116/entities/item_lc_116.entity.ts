import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ITEM_LC_116 {
  @PrimaryGeneratedColumn()
  COD_ITEM: string;

  @Column({ type: 'varchar', length: 2000 })
  DESC_ITEM: string
}