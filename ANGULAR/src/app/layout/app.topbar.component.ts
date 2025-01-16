import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { LayoutService } from './service/app.layout.service';
import { LoginService } from '../Geral/login/login.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {
    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;

    userName: string | null = '';
    empresaNome: string | null = '';

    constructor(
        public layoutService: LayoutService,
        private loginService: LoginService,
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
}
