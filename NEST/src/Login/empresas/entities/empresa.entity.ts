import { Webservice } from 'src/Geral/Nota-Fiscal/Nfse/webservice/entities/webservice.entity';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('EMPRESAS')
export class empresa {
  @PrimaryColumn({ type: 'text', length: 14 })
  CNPJ: string;

  @Column({ type: 'text', length: 50, nullable: true })
  IM: string;

  @Column({ type: 'text', length: 300 })
  NOME: string;
  
  @Column({ type: 'text', length: 2 })
  OPTANTE_SN: string;

  @Column({ type: 'text', length: 2, nullable: true  })
  OPTANTE_MEI: string;

  @Column({ nullable: true })
  AMBIENTE_INTEGRACAO_ID: number;  // Armazena o ID do webservice

  @ManyToOne(() => Webservice)
  @JoinColumn({ name: 'AMBIENTE_INTEGRACAO_ID' })
  AMBIENTE_INTEGRACAO: Webservice;  // Relação com a tabela WEBSERVICE


  @Column({ type: 'blob', nullable: true })
  certificado: Buffer;

  @Column({ type: 'text', nullable: true }) // Melhor para armazenar hashes de senha
  senha: string;  

  @Column({ type: 'datetime', nullable: true}) // SQLite
  data_upload: Date;
}
