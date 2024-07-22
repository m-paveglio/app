import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
 export class ATIVIDADES {
        @PrimaryGeneratedColumn()
        COD_ATIVIDADE: string;
      
        @Column({ type: 'varchar', length: 2000 })
        DESC_ATIVIDADE: string
    }
    