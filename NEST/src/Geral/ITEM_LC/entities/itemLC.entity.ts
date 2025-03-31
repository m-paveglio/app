import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ITEM_LC')
export class ItemLC {
  @PrimaryGeneratedColumn()
  COD_ITEM_LC: string;

  @Column({ length: 500, nullable: false })
  DESC_ITEM_LC: string;
 
}