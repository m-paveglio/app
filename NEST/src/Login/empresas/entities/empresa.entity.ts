import { Entity, Column, PrimaryColumn } from 'typeorm';

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

  // Adicionando a coluna AMBIENTE_INTEGRACAO
  @Column({ type: 'text', nullable: true })
  AMBIENTE_INTEGRACAO: string; // Pode ser '1' ou '2', ou NULL

  @Column({ type: 'blob', nullable: true })
  certificado: Buffer;

  @Column({ type: 'text', nullable: true }) // Melhor para armazenar hashes de senha
  senha: string;  

  @Column({ type: 'datetime', nullable: true}) // SQLite
  data_upload: Date;
}
