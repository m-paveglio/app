import { Component } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService]
})
export class LoginComponent {
  credentials = { CPF: '', SENHA: '' };
  empresas: any[] = [];
  empresaSelecionada: any = null;
  selecionandoEmpresa = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onCPFInputChange(event: any) {
    this.credentials.CPF = event.target.value.replace(/[.\-]/g, '');
  }

  onPasswordInputChange(event: any) {
    this.credentials.SENHA = event.target.value;
  }

  onLogin() {
    this.credentials.CPF = this.credentials.CPF.replace(/[.\-]/g, '');

    this.loginService.login(this.credentials).subscribe(
      (response: any) => {
        if (response && response.user && response.user.empresas.length > 0) {
          const empresasCompletas = response.user.empresas.map(async (empresa: any) => {
            const empresas = await this.loginService.buscarPorCnpj(empresa.CNPJ).toPromise();
            return {
              ...empresa,
              NOME: empresas?.NOME || 'Não encontrada',
              IM: empresas?.IM || 'Sem IM',
              OPTANTE_SN: empresas?.OPTANTE_SN === '1' ? 'Optante do SN' : 'Não Optante do SN',
            };
          });

          Promise.all(empresasCompletas).then((empresas) => {
            this.empresas = empresas;
            this.selecionandoEmpresa = true;
            this.mostrarMensagem('Login bem-sucedido! Selecione uma empresa.', true);
          });
        } else {
          this.mostrarMensagem('Nenhuma empresa vinculada ao usuário.', false);
        }
      },
      (error) => {
        console.error('Erro no login:', error);
        this.processarErro(error);
      }
    );
  }

  selecionarEmpresa(empresa: any) {
    this.loginService.setEmpresaSelecionada(empresa);
    this.router.navigate(['/dashboard']);
    this.mostrarMensagem(`Empresa ${empresa.NOME} selecionada com sucesso!`, true);
  }

  processarErro(mensagemErro: string) {
    if (mensagemErro.includes('Credenciais inválidas')) {
      this.mostrarMensagem('Verifique seu CPF ou Senha.', false);
    } else {
      this.mostrarMensagem('Erro ao tentar fazer login. Tente novamente mais tarde.', false);
    }
  }

  mostrarMensagem(mensagem: string, sucesso: boolean) {
    this.messageService.add({
      severity: sucesso ? 'success' : 'error',
      summary: sucesso ? 'Sucesso' : 'Erro',
      detail: mensagem,
      life: 3000
    });
  }
}
