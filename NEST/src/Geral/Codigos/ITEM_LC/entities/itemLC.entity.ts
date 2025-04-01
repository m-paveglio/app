import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('ITEM_LC')
export class ItemLC {
  @PrimaryColumn()
  COD_ITEM_LC: string;

  @Column({ length: 2000, nullable: false })
  DESC_ITEM_LC: string;
 
}