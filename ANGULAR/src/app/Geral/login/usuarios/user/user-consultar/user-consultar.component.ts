import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';
import { EmpresasService } from '../../empresas/empresas.service';
import { cnpj } from 'cpf-cnpj-validator'; // Importando a biblioteca
import { Dialog } from 'primeng/dialog';


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
  CPF: string = '';
  CNPJ: string = '';
  nome: string = '';
  COD_PERMISSAO: string = '';
  USER_STATUS: string = '';
  resultado: any = null;
  resultadoEmpresa: any = null;
  novoUsuario: any = {};
  editMode = false;
  TIPO_USER_nome: string = '';
  usuariosEncontrados: any[] = [];
  empresasVinculadas: any[] = []; // Lista de empresas vinculadas
  showForm: boolean = false; // Controla exibição do formulário para novo vínculo
  permissoes: any[] = [];

  TIPO_USER = [
    { nome: 'Admin', codigo: '1' },
    { nome: 'Suporte', codigo: '2' },
    { nome: 'Usuário', codigo: '3' }
  ];

  OPTANTE_SN = [
    { nome: 'OPTANTE', codigo: '1' },
    { nome: 'NÃO OPTANTE', codigo: '0' }
  ];

  constructor(
    private EmpresasService: EmpresasService,
    private userService: UserService,
    public dialog: MatDialog,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) {}

  isCpfValido(CPF: string): boolean {
    // Validação de CPF
    if (!CPF || CPF.length !== 11) return false;
    let soma = 0, resto;
    if (CPF === '00000000000') return false;
    for (let i = 1; i <= 9; i++) soma += parseInt(CPF.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(CPF.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(CPF.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    return resto === parseInt(CPF.substring(10, 11));
  }

  buscarUsuario() {
    // Verifica se o CPF está preenchido e válido para busca por CPF
    if (this.CPF && this.isCpfValido(this.CPF)) {
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
    if (!this.isCpfValido(this.CPF)) {
      this.showError('CPF inválido!');
      return;
    }
  
    this.userService.buscarPorCpf(this.CPF).subscribe(
      (data) => {
        if (data && Object.keys(data).length > 0) {
          this.resultado = data;
  
          // Converte TIPO_USER para exibir o nome correspondente em outra propriedade
          const tipoUser = this.TIPO_USER.find(t => t.codigo === this.resultado.TIPO_USER);
          this.resultado.TIPO_USER_nome = tipoUser ? tipoUser.nome : '';
          this.carregarEmpresasVinculadas();
  
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

  isCnpjValido(cnpjStr: string): boolean {
    return cnpj.isValid(cnpjStr); // Validação usando a biblioteca
  }

  buscarEmpresa() {
    // Verifica se o CNPJ está preenchido e válido para busca por CNPJ
    if (this.CNPJ && this.isCnpjValido(this.CNPJ)) {
      this.buscarPorCnpj();
    } 
  }

  buscarNomeEmpresaPorCnpj(cnpj: string) {
    this.EmpresasService.buscarPorCnpj(cnpj).subscribe(
      (data) => {
        if (data && data.NOME) {
          return data.NOME; // Retorna o nome da empresa
        }
        return 'Não encontrada'; // Caso não encontre, retorna uma string vazia
      },
      (error) => {
        console.error('Erro ao buscar nome da empresa:', error);
        return ''; // Retorna vazio em caso de erro
      }
    );
  }

  buscarPorCnpj() {
    if (!this.isCnpjValido(this.CNPJ)) {
      this.showError('CNPJ inválido!');
      return;
    }
  
    this.EmpresasService.buscarPorCnpj(this.CNPJ).subscribe(
      (data) => {
        console.log('Dados da empresa:', data);  // Verifique a estrutura de dados retornados
        if (data && Object.keys(data).length > 0) {
          this.resultado = data;
          const OPTANTE_SN = this.OPTANTE_SN.find(t => t.codigo === this.resultado.OPTANTE_SN);
          this.resultado.OPTANTE_SN_nome = OPTANTE_SN ? OPTANTE_SN.nome : '';
          console.log(this.resultado); // Verifique se a propriedade NOME está aqui
        } else {
          this.showError('Empresa não existe no banco de dados.');
          this.resultado = null;
        }
      },
      (error) => {
        console.error('Erro ao buscar por CNPJ:', error);
        this.showError('Erro ao buscar CNPJ. Por favor, tente novamente.');
        this.resultado = null;
      }
    );
  }

 ngOnInit() {
  this.carregarPermissoes();
  this.carregarEmpresasVinculadas();
}

carregarPermissoes() {
  this.userService.getPermissoes().subscribe(
    (data) => {
      this.permissoes = data.map((item: any) => ({
        codigo: item.COD_PERMISSAO.toString(),  // Garantir que seja string
        nome: item.DESC_PERMISSAO   // Campo que será exibido no dropdown
      }));
      // Remova ou comente a linha abaixo para evitar o log no console
      // console.log('Permissões carregadas:', this.permissoes);
    },
    (error) => {
      console.error('Erro ao carregar permissões:', error);
      this.showError('Erro ao carregar permissões. Tente novamente.');
    }
  );
}

getPermissaoNome(codigo: string) {
  let permissao = this.permissoes.find(p => {
    return p.codigo.toString() === String(codigo);
  });
  return permissao ? permissao.nome : '';
}

carregarEmpresasVinculadas() {
  if (!this.CPF) return;

  this.userService.buscarEmpresasVinculadas(this.CPF).subscribe({
    next: (empresas) => {
      const promises = empresas.map(async (empresa) => {
        const nomeEmpresa = await this.EmpresasService.buscarPorCnpj(empresa.CNPJ).toPromise();
        return {
          ...empresa,
          NOME: nomeEmpresa?.NOME || 'Não encontrada',    //CAMPOS DA TABELA EMPRESA
          IM: nomeEmpresa?.IM || 'SEM IM',                //CAMPOS DA TABELA EMPRESA
        };
      });

      Promise.all(promises).then((empresasComNomes) => {
        this.empresasVinculadas = empresasComNomes;
        this.cd.detectChanges(); // Força a detecção de mudanças
      });
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar empresas vinculadas.',
      });
    },
  });
}

abrirFormularioVinculo() {
  this.showForm = true;
}

adicionarVinculo() {
  if (!this.CPF || !this.CNPJ || !this.COD_PERMISSAO || !this.USER_STATUS) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aviso',
      detail: 'Todos os campos são obrigatórios.',
    });
    return;
  }

  // Verifica se o CNPJ existe
  this.EmpresasService.buscarPorCnpj(this.CNPJ).subscribe({
    next: (empresa) => {
      if (!empresa || !empresa.NOME) {
        // CNPJ não encontrado
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'O CNPJ informado não existe na tabela de empresas.',
        });
        return;
      }

      // CNPJ válido, prossegue com a adição do vínculo
      const vinculo = {
        CPF: this.CPF,
        CNPJ: this.CNPJ,
        COD_PERMISSAO: this.COD_PERMISSAO,
        USER_STATUS: this.USER_STATUS,
      };

      this.userService.adicionarVinculo(vinculo).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Vínculo adicionado com sucesso!',
          });
          this.showForm = false;
          this.carregarEmpresasVinculadas(); // Recarrega a tabela
          this.CNPJ = '';
          this.COD_PERMISSAO = '';
          this.USER_STATUS = '';
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao adicionar vínculo.',
          });
        },
      });
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao validar o CNPJ.',
      });
    },
  });
}

abrirEdicaoVinculo(empresa: any) {
  this.editMode = true;
  this.CNPJ = empresa.CNPJ;
  this.COD_PERMISSAO = empresa.COD_PERMISSAO;
  this.USER_STATUS = empresa.USER_STATUS;
  this.showForm = true; // Mostra o formulário para edição
}

confirmarExclusaoVinculo(cnpj: string) {
  this.confirmationService.confirm({
    message: 'Tem certeza que deseja excluir este vínculo?',
    header: 'Confirmação de Exclusão',
    icon: 'pi pi-exclamation-triangle',
    acceptButtonStyleClass: 'p-button-danger p-button-text',
    rejectButtonStyleClass: 'p-button-text',
    acceptIcon: 'none',
    rejectIcon: 'none',
    acceptLabel: 'Sim',
    rejectLabel: 'Não',
    accept: () => {
      this.excluirVinculo(cnpj);
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Cancelado',
        detail: 'A exclusão foi cancelada.',
      });
    },
  });
}

excluirVinculo(cnpj: string) {
  this.userService.excluirVinculo(cnpj).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Vínculo excluído com sucesso!',
      });
      this.carregarEmpresasVinculadas(); // Recarrega a tabela
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao excluir vínculo.',
      });
    },
  });
}

atualizarVinculo(empresa: any) {
  const vinculoAtualizado = {
    COD_PERMISSAO: empresa.COD_PERMISSAO,
    USER_STATUS: empresa.USER_STATUS,
  };

  this.userService.atualizarVinculo(empresa.CNPJ, vinculoAtualizado).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Vínculo atualizado com sucesso!',
      });
      this.carregarEmpresasVinculadas(); // Recarrega a tabela
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao atualizar vínculo.',
      });
    },
  });
}

salvarEdicaoVinculo() {
  if (!this.CNPJ || !this.COD_PERMISSAO || !this.USER_STATUS) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aviso',
      detail: 'Todos os campos são obrigatórios para salvar as alterações.',
    });
    return;
  }

  const vinculoAtualizado = {
    COD_PERMISSAO: this.COD_PERMISSAO,
    USER_STATUS: this.USER_STATUS,
  };

  this.userService.editarVinculo(this.CNPJ, vinculoAtualizado).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Vínculo atualizado com sucesso!',
      });
      this.editMode = false;
      this.showForm = false;
      this.carregarEmpresasVinculadas(); // Atualiza a tabela
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao atualizar vínculo.',
      });
    },
  });
}

cancelarEdicaoVinculo() {
  this.editMode = false;
  this.showForm = false;
  this.CNPJ = '';
  this.COD_PERMISSAO = '';
  this.USER_STATUS = '';
}

abrirDialogo() {
  this.showForm = true;
}

fecharDialogo() {
  this.showForm = false;
  this.limparFormulario();
}

limparFormulario() {
  this.CNPJ = '';
  this.COD_PERMISSAO = '';
  this.USER_STATUS = '';
}

cancelarEdicao() {
  this.editMode = false;
  // Adicione qualquer lógica necessária para restaurar os dados originais
}

}