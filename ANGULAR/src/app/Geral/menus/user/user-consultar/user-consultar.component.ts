import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from './confirmacao.component';

@Component({
  selector: 'app-user-consultar',
  templateUrl: './user-consultar.component.html',
  styleUrls: ['./user-consultar.component.css']
})
export class UserConsultarComponent {
  cpf: string = '';
  nome: string = '';
  resultado: any;
  novoUsuario: any = {}; // Dados do novo usuário a serem adicionados ou editados
  editMode = false; // Controla se os campos estão em modo de edição
  erroMessage: string = ''; // Adiciona mensagem de erro
  mensagem: string = '';
  exibirMensagem: boolean = false;
  isCadastroSucesso: boolean = false;
  permissoes = [
    { nome: 'Administrador', codigo: '1' },
    { nome: 'Suporte', codigo: '2' },
    { nome: 'Contador', codigo: '3' },
    { nome: 'Diretor', codigo: '4' },
    { nome: 'Gerente', codigo: '5' },
    { nome: 'Procurador', codigo: '6' },
    { nome: 'Auxiliar Administrativo', codigo: '7' },
    { nome: 'Auxiliar Contábil', codigo: '8' },
    { nome: 'Atendente', codigo: '9' },
    { nome: 'Estagiário', codigo: '10' }
  ];
  USER_SIS = [
    { nome: 'Ativo', codigo: '1' },
    { nome: 'Desativado', codigo: '0' }
  ];

  nomePermissao: string = '';
  user_sis_nome: string = '';
  isEditing: boolean = false;

  constructor(private userService: UserService, public dialog: MatDialog) {}

  isCpfValido(cpf: string): boolean {
    if (!cpf || cpf.length !== 11) return false;

    let soma = 0;
    let resto;
    if (cpf === '00000000000') return false;

    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  buscarPorCpf() {
    this.erroMessage = '';

    if (!this.isCpfValido(this.cpf)) {
      this.erroMessage = 'CPF inválido!';
      this.removerMensagemErro();
      return;
    }

    this.userService.buscarPorCpf(this.cpf).subscribe(
      (data) => {
        if (data) {
          this.resultado = data;
          this.nomePermissao = this.getPermissaoNome(this.resultado.COD_PERMISSAO);
          this.user_sis_nome = this.getUserSisNome(this.resultado.USER_SIS);
        } else {
          this.erroMessage = 'CPF não encontrado no banco de dados.';
          this.removerMensagemErro();
        }
      },
      (error: any) => {
        console.error('Erro ao buscar por CPF:', error);
        this.erroMessage = 'Erro ao buscar CPF. Por favor, tente novamente.';
        this.removerMensagemErro();
      }
    );
  }

  removerMensagemErro() {
    setTimeout(() => {
      this.erroMessage = '';
    }, 3000);
  }

  buscarPorNome() {
    this.userService.buscarPorNome(this.nome).subscribe(
      (data) => {
        this.resultado = data;
      },
      (error: any) => {
        console.error('Erro ao buscar por nome:', error);
      }
    );
  }

  editarUsuario(cpf: string) {
    this.userService.editarUsuario(cpf, this.novoUsuario).subscribe(
      (data) => {
        this.resultado = data;
        this.editMode = true;
        this.novoUsuario = {};
        this.isEditing = true;
      },
      (error: any) => {
        console.error('Erro ao editar usuário:', error);
      }
    );
  }

  salvarUsuario(cpf: string) {
    this.userService.atualizarUsuario(this.resultado).subscribe(
      () => {
        this.erroMessage = 'Usuário atualizado com sucesso!';
        this.editMode = false;
        this.removerMensagemErro();
      },
      (error: any) => {
        console.error('Erro ao salvar o usuário:', error);
        this.erroMessage = 'Erro ao salvar o usuário. Por favor, tente novamente.';
        this.removerMensagemErro();
      }
    );
  }

  excluirUsuario(cpf: string) {
    this.userService.excluirUsuario(cpf).subscribe(
      (data) => {
        this.resultado = data;
      },
      (error: any) => {
        console.error('Erro ao excluir usuário:', error);
      }
    );
  }

  openDialog(cpf: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '350px',
      data: 'Você realmente quer excluir este usuário?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.excluirUsuario(cpf);
      }
    });
  }

  getPermissaoNome(codigo: string) {
    let permissao = this.permissoes.find(p => p.codigo === codigo);
    return permissao ? permissao.nome : '';
  }

  getUserSisNome(codigo: string) {
    let userSis = this.USER_SIS.find(u => u.codigo === codigo);
    return userSis ? userSis.nome : '';
  }

  confirmarExclusao() {
    const confirmacao = confirm('Tem certeza que deseja excluir o usuário?');
    if (confirmacao) {
      this.excluirUsuario(this.resultado.CPF);
    }
  }
}
