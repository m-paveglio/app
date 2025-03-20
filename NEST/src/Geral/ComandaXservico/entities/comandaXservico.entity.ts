import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Servicos } from 'src/Geral/Servicos/entities/servico.entity';

@Entity('ComandaXservico')
export class ComandasXServicos {
  @PrimaryColumn()
  COD_COMANDA: string;

  @PrimaryColumn()
  COD_SERVICO: string;

  @Column({ type: 'text', length: 14, nullable: false })
  CNPJ_PRESTADOR: string;

  @ManyToOne(() => Servicos, (servico) => servico.COD_SERVICO, { eager: true })
  @JoinColumn({ name: 'COD_SERVICO' })
  servico: Servicos;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  VALOR: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  QUANTIDADE: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  VALOR_FINAL: number;
}