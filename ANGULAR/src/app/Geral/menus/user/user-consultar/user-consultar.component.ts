import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from './confirmacao.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-consultar',
  templateUrl: './user-consultar.component.html',
  styleUrls: ['./user-consultar.component.css'],
  providers: [MessageService] // Adicione o MessageService como provedor
})
export class UserConsultarComponent {
  cpf: string = '';
  nome: string = '';
  resultado: any = null; // Definindo como null inicialmente
  novoUsuario: any = {};
  editMode = false;
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

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private messageService: MessageService
  ) {}

  isCpfValido(cpf: string): boolean {
    // Validação de CPF
    if (!cpf || cpf.length !== 11) return false;
    let soma = 0, resto;
    if (cpf === '00000000000') return false;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    return resto === parseInt(cpf.substring(10, 11));
  }

  buscarPorCpf() {
    if (!this.isCpfValido(this.cpf)) {
        this.showError('CPF inválido!');
        return;
    }

    this.userService.buscarPorCpf(this.cpf).subscribe(
        (data) => {
            if (data && Object.keys(data).length > 0) {
                this.resultado = data;
                this.nomePermissao = this.getPermissaoNome(this.resultado.COD_PERMISSAO);
                this.user_sis_nome = this.getUserSisNome(this.resultado.USER_SIS);
            } else {
                this.showError('Usuário não existe no banco de dados.');
                this.resultado = null; // Limpa o resultado se não encontrado
            }
        },
        (error) => {
            console.error('Erro ao buscar por CPF:', error);
            this.showError('Erro ao buscar CPF. Por favor, tente novamente.');
            this.resultado = null; // Limpa o resultado em caso de erro
        }
    );
}

  editarUsuario(cpf: string) {
  this.userService.buscarPorCpf(cpf).subscribe(
      (data) => {
          this.resultado = data;
          this.nomePermissao = this.getPermissaoNome(this.resultado.COD_PERMISSAO);
          this.user_sis_nome = this.getUserSisNome(this.resultado.USER_SIS);
          this.editMode = true; // Ativando o modo de edição
          this.showSuccess('Usuário em modo de edição');
      },
      (error) => {
        console.error('Erro ao editar usuário:', error);
        if (error.error && error.error.message) {
          this.processarErro(error.error.message);
        } else {
          this.showError('Erro ao cadastrar usuário');
        }
      }
    );
  }

  salvarUsuario() {
  const updatePayload = {
    COD_PERMISSAO: this.resultado.COD_PERMISSAO,
    USER_SIS: this.resultado.USER_SIS,
    CPF: this.resultado.CPF,
    NOME: this.resultado.NOME,
    EMAIL: this.resultado.EMAIL,
    SENHA: this.resultado.SENHA
  };

  this.userService.atualizarUsuario(this.resultado.CPF, updatePayload).subscribe(
    () => {
      this.editMode = false;
      this.showSuccess('Usuário atualizado com sucesso!');
    },
    (error) => {
      console.error('Erro ao atualizar usuário:', error);
      if (error.error && error.error.message) {
        this.processarErro(error.error.message);
      } else {
        this.showError('Erro ao atualizar usuário');
      }
    }
  );
}

  processarErro(mensagemErro: string) {
  if (mensagemErro.includes('usuário já existe')) {
    this.showError('Erro: o usuário já existe.');
  } else if (mensagemErro.includes('campos obrigatórios')) {
    this.showError('Erro: preencha todos os campos obrigatórios.');
  } else {
    this.showError('Erro ao cadastrar usuário');
  }
}

  excluirUsuario(cpf: string) {
    this.userService.excluirUsuario(cpf).subscribe(
      () => {
        this.resultado = null;
        this.showSuccess('Usuário excluído com sucesso!');
      },
      (error) => {
        console.error('Erro ao excluir usuário:', error);
        this.showError('Erro ao excluir o usuário.');
      }
    );
  }

  showSuccess(mensagem: string) {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: mensagem });
  }

  showError(mensagem: string) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: mensagem });
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
