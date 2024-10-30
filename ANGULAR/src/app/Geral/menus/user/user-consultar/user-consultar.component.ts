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
  resultado: any;
  novoUsuario: any = {}; // Dados do novo usuário a serem adicionados ou editados
  editMode = false; // Controla se os campos estão em modo de edição
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
        if (data) {
          this.resultado = data;
          this.nomePermissao = this.getPermissaoNome(this.resultado.COD_PERMISSAO);
          this.user_sis_nome = this.getUserSisNome(this.resultado.USER_SIS);
        } else {
          // Exibe toast de erro se o CPF não for encontrado
          this.showError('Usuário não existe no banco de dados.');
        }
      },
      (error) => {
        console.error('Erro ao buscar por CPF:', error);
        this.showError('Erro ao buscar CPF. Por favor, tente novamente.');
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
          this.showError('Erro ao editar usuário.');
      }
  );
}

salvarUsuario() {
  // Supondo que 'resultado' tenha as propriedades 'codigoPermissao' e 'ativo'
  const updatePayload = {
      codigoPermissao: this.resultado.COD_PERMISSAO,
      ativo: this.resultado.USER_SIS,
  };

  this.userService.atualizarUsuario(this.resultado.CPF, updatePayload).subscribe(
      () => {
          this.editMode = false; // Desativa o modo de edição
          this.showSuccess('Usuário atualizado com sucesso!');
      },
      (error) => {
          console.error('Erro ao salvar o usuário:', error);
          this.showError('Erro ao salvar o usuário. Por favor, tente novamente.');
      }
  );
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
