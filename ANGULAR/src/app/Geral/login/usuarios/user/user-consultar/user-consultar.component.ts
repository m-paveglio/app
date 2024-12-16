import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';


interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-user-consultar',
  templateUrl: './user-consultar.component.html',
  styleUrls: ['./user-consultar.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class UserConsultarComponent {
  cols!: Column[];
  cpf: string = '';
  nome: string = '';
  resultado: any = null;
  novoUsuario: any = {};
  editMode = false;
  TIPO_USER_nome: string = '';
  usuariosEncontrados: any[] = [];

  TIPO_USER = [
    { nome: 'Admin', codigo: '1' },
    { nome: 'Suporte', codigo: '2' },
    { nome: 'Usuário', codigo: '3' }
  ];


  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
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

  buscarUsuario() {
    // Verifica se o CPF está preenchido e válido para busca por CPF
    if (this.cpf && this.isCpfValido(this.cpf)) {
      this.buscarPorCpf();
    } 
    // Caso CPF esteja vazio, tenta buscar por nome
    else if (this.nome) {
      this.buscarPorNome();
    } 
    // Mensagem de erro caso ambos estejam inválidos
    else {
      this.showError('Preencha um CPF válido ou Nome para realizar a busca.');
    }
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
  
          // Converte TIPO_USER para exibir o nome correspondente em outra propriedade
          const tipoUser = this.TIPO_USER.find(t => t.codigo === this.resultado.TIPO_USER);
          this.resultado.TIPO_USER_nome = tipoUser ? tipoUser.nome : '';
  
          console.log(this.resultado);
        } else {
          this.showError('Usuário não existe no banco de dados.');
          this.resultado = null;
        }
      },
      (error) => {
        console.error('Erro ao buscar por CPF:', error);
        this.showError('Erro ao buscar CPF. Por favor, tente novamente.');
        this.resultado = null;
      }
    );
  }
  
  buscarPorNome() {
    this.userService.buscarPorNome(this.nome).subscribe(
      (data) => {
        if (data) {
          // Se data for um array, mapeia para garantir estrutura de propriedades
          if (Array.isArray(data) && data.length > 0) {
            this.usuariosEncontrados = data.map(usuario => ({
              CPF: usuario.CPF,
              NOME: usuario.NOME
            }));
            this.resultado = null; // Limpa resultado ao exibir lista de opções
          } 
          // Se data não for um array, assume que é um único usuário e exibe diretamente
          else if (!Array.isArray(data)) {
            this.resultado = { CPF: data.CPF, NOME: data.NOME, TIPO_USER: data.TIPO_USER };
            this.usuariosEncontrados = []; // Limpa a lista de opções
          }
        } else {
          // Caso não encontre nenhum usuário
          this.showError('Usuário não encontrado pelo nome.');
          this.usuariosEncontrados = [];
          this.resultado = null;
        }
      },
      (error) => {
        console.error('Erro ao buscar por Nome:', error);
        this.showError('Erro ao buscar Nome. Por favor, tente novamente.');
        this.usuariosEncontrados = [];
        this.resultado = null;
      }
    );
}
  
selecionarUsuario(usuario: any) {
  // Define o usuário selecionado como o `resultado`
  this.userService.buscarPorCpf(usuario.CPF).subscribe(
    (data) => {
      this.resultado = data;
      this.usuariosEncontrados = []; // Limpa a lista de opções
    },
    (error) => {
      console.error('Erro ao selecionar usuário:', error);
      if (error.error && error.error.message) {
        this.processarErro(error.error.message);
      } else {
        this.showError('Erro ao selecionar usuário');
      }
    }
  );
}

  salvarUsuario() {
  const updatePayload = {
    TIPO_USER: this.resultado.TIPO_USER,
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

  showSuccess(mensagem: string) {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: mensagem });
  }

  showError(mensagem: string) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: mensagem });
  }


  getTipoUserNome(codigo: string) {
    let TIPO_USER = this.TIPO_USER.find(u => u.codigo === codigo);
    return TIPO_USER ? TIPO_USER.nome : '';
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

  confirmarExclusao() {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir o usuário?',
      header: 'Confirmação de Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: "Sim", // Define o rótulo do botão de aceitar
      rejectLabel: "Não", // Define o rótulo do botão de rejeitar
      accept: () => {
        this.excluirUsuario(this.resultado.CPF);
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejeição', detail: 'Usuario Não Deletado' });
      }
    });
  }

  editarUsuario(cpf: string) {
    this.userService.buscarPorCpf(cpf).subscribe(
      (data) => {
        this.resultado = data;
        this.editMode = true;
      },
      (error) => {
        console.error('Erro ao editar usuário:', error);
        if (error.error && error.error.message) {
          this.processarErro(error.error.message);
        } else {
          this.showError('Erro ao buscar usuário para edição.');
        }
      }
    );
}
}