import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class user {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({ length: 11, unique: true})
  cpf: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 2 })
  DDD: string 

  @Column({ length: 15 })
  TELEFONE_CELULAR: string 

  @Column({ length: 50 })
  PERMISSAO: string
  
  @Column({ length: 50 })
  CARGO: string 

  @Column({ length: 15 })
  DT_NASCIMENTO: string 

  @Column({ length: 10 })
  CEP: string 

  @Column({ length: 100 })
  RUA_LOGRADOURO: string
  
  @Column({ length: 10 })
  NUMERO_LOGRADOURO: string 

  @Column({ length: 100 }) 
  BAIRRO_LOGRADOURO: string 

  @Column({ length: 100 }) 
  COMPLEMENTO_LOGRADOURO: string 

  @Column({ length: 100 })
  CIDADE: string 

  @Column({ length: 2 })
  UF: string
}