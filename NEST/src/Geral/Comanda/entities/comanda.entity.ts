import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { pessoas } from 'src/Geral/Pessoas/pessoas.entity';
import { Servicos } from 'src/Geral/Servicos/entities/servico.entity';

@Entity('Comanda')
export class Comandas {
  @PrimaryGeneratedColumn()
  COD_COMANDA: string;

  @Column ({ type: 'text', length: 14, nullable: false })
  CNPJ_PRESTADOR: string;
  
  @ManyToOne(() => pessoas, (pessoa) => pessoa.CPF_CNPJ, { eager: true })
  @Column({ type: 'text', length: 14, nullable: true })
  CPF_CNPJ: string;

  @Column({ type: 'varchar', length: 100 })
  NOME: string;

  @ManyToOne(() => Servicos, (servico) => servico.COD_SERVICO, { eager: true })
  @Column({ length: 20, nullable: false })
  COD_SERVICO: string;

  @Column('decimal', { precision: 10, scale: 2 })
  VALOR: number;

  @Column('decimal', { precision: 10, scale: 2 })
  QUANTIDADE: number;

  @Column('decimal', { precision: 10, scale: 2 })
  VALOR_FINAL: number;

  @Column({ type: 'datetime', nullable: false })
  DATA_INICIO: Date;

  @Column({ type: 'datetime', nullable: true })
  DATA_FINAL: Date;
}
