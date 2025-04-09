import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { LayoutService } from './service/app.layout.service';
import { LoginService } from '../Geral/login/login.service';
import { UserService } from '../Geral/login/usuarios/user/user.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.css'],
})  
export class AppTopBarComponent {
    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;

    userName: string | null = '';
    empresaNome: string | null = '';
    dialogEditarPerfil: boolean = false;
    editMode: boolean = false;
    resultado: any = {}; // Armazena os dados do usuário

    constructor(
        public layoutService: LayoutService,
        private loginService: LoginService,
        private userService: UserService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.userName = this.loginService.getUserName();
        const empresa = this.loginService.getEmpresaSelecionada();
        this.empresaNome = empresa ? empresa.NOME : 'Nenhuma empresa selecionada';
    }

    onLogout(): void {
        this.loginService.logout();
        sessionStorage.clear();
        this.router.navigate(['/login']);
    }

    abrirDialogEditarPerfil(): void {
        const CPF = localStorage.getItem('cpfUsuarioLogado');
        console.log('CPF armazenado:', CPF);
      
        if (!CPF) return;
      
        // Fecha o sidebar ao abrir o dialog (opcional, se estiver atrapalhando)
        this.layoutService.state.profileSidebarVisible = false;
      
        this.userService.buscarPorCpf(CPF).subscribe({
          next: (res) => {
            this.resultado = { ...res, SENHA: '' }; // Limpa a senha ao abrir o formulário
            this.dialogEditarPerfil = true;
            this.editMode = false;
          },
          error: (err) => {
            console.error('Erro ao buscar dados do usuário:', err);
          }
        });
      }

      mostrarCpfLogado(): void {
        const cpf = localStorage.getItem('cpfUsuarioLogado');
        console.log('CPF do usuário logado:', cpf);
        alert(`CPF logado: ${cpf ?? 'Não encontrado no localStorage'}`);
      }

      editarUsuario(): void {
        this.editMode = true;
      }
      
      salvarUsuario(): void {
        const dadosAtualizados = { ...this.resultado };

        // Remove a senha se estiver vazia
        if (!dadosAtualizados.SENHA || dadosAtualizados.SENHA.trim() === '') {
          delete dadosAtualizados.SENHA;
        }
        
        this.userService.atualizarUsuario(this.resultado.CPF, dadosAtualizados).subscribe({
          next: () => {
            this.editMode = false;
          },
          error: (err) => {
            console.error('Erro ao salvar usuário:', err);
          }
        });
      }
      
      cancelarEdicao(): void {
        this.abrirDialogEditarPerfil(); // Recarrega os dados para resetar
      }
      
      confirmarExclusao(): void {
        if (confirm("Tem certeza que deseja excluir seu perfil?")) {
          this.userService.excluirUsuario(this.resultado.CPF).subscribe({
            next: () => {
              alert("Usuário excluído com sucesso.");
              this.dialogEditarPerfil = false;
            },
            error: (err) => {
              console.error('Erro ao excluir usuário:', err);
            }
          });
        }
      }
}
