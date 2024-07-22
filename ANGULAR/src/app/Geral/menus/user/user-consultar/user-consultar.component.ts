import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from './confirmacao.component';


@Component({
  selector: 'app-user-consultar',
  templateUrl: './user-consultar.component.html'
})
export class UserConsultarComponent {
  cpf: string ='';
  nome: string ='';
  resultado: any;
  novoUsuario: any = {}; // Dados do novo usuário a serem adicionados ou editados
  permissoes = [
    {nome: 'Administrador', codigo: '1'},
    {nome: 'Suporte', codigo: '2'},
    {nome: 'Contador', codigo: '3'},
    {nome: 'Diretor', codigo: '4'},
    {nome: 'Gerente', codigo: '5'},
    {nome: 'Procurador', codigo: '6'},
    {nome: 'Auxiliar Administrativo', codigo: '7'},
    {nome: 'Auxiliar Contábil', codigo: '8'},
    {nome: 'Atendente', codigo: '9'},
    {nome: 'Estagiário', codigo: '10'}
  ];
      USER_SIS = [
      {nome: 'Ativo', codigo: '1'},
      {nome: 'Desativado', codigo: '0'}
    ];

    nomePermissao: string = '';
    user_sis_nome: string = '';
    isEditing: boolean = false;

  constructor(private userService: UserService, public dialog: MatDialog

  ) {}

  buscarPorCpf() {
    this.userService.buscarPorCpf(this.cpf).subscribe(
      (data) => {
        this.resultado = data;
        this.nomePermissao = this.getPermissaoNome(this.resultado.COD_PERMISSAO);
        this.user_sis_nome = this.getUserSisNome(this.resultado.USER_SIS);
      },
      (error) => {
        console.error('Erro ao buscar por CPF:', error);
      }
    );
  }

  buscarPorNome() {
    this.userService.buscarPorNome(this.nome).subscribe(
      (data) => {
        this.resultado = data;
      },
      (error) => {
        console.error('Erro ao buscar por nome:', error);
      }
    );
  }

  editarUsuario(cpf: string) {
    this.userService.editarUsuario(cpf, this.novoUsuario).subscribe(
      (data) => {
        this.resultado = data;
        this.novoUsuario = {}; // Limpa os dados do novo usuário após edição
        this.isEditing = true;
      },
      (error) => {
        console.error('Erro ao editar usuário:', error);
      }
    );
  }

  excluirUsuario(cpf: string) {
    this.userService.excluirUsuario(cpf).subscribe(
      (data) => {
        this.resultado = data;
      },
      (error) => {
        console.error('Erro ao excluir usuário:', error);
      }
    );
  }

  openDialog(cpf: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '350px',
      data: "Você realmente quer excluir este usuário?"
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.excluirUsuario(cpf);
      }
    });
  }

  getPermissaoNome(codigo: string) {
    let permissao = this.permissoes.find(p => p.codigo === codigo);
    return permissao ? permissao.nome : '';
  }

  getUserSisNome(codigo: string) {
    let USER_SIS = this.USER_SIS.find(u => u.codigo === codigo);
    return USER_SIS ? USER_SIS.nome : '';
  }
}