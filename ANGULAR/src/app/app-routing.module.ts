import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagInicialComponent } from './pag-inicial/pag-inicial.component';
import { LoginComponent } from './Geral/login/login.component';
import { DashboardComponent } from './Geral/dashboard/dashboard.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { UserIncluirComponent } from './Geral/login/usuarios/user/user-incluir/user-incluir.component';
import { UserConsultarComponent } from './Geral/login/usuarios/user/user-consultar/user-consultar.component';
import { UserRelatorioComponent } from './Geral/login/usuarios/user/user-relatorio/user-relatorio.component';
import { GerarNfseComponent } from './Geral/menus/nfse/enviar/gerar-nfse.component';
import { AuthGuardService } from './Geral/login/AuthGuardService';
import { EmpresasIncluirComponent } from './Geral/login/usuarios/empresas/empresas-incluir/empresas-incluir.component';
import { EmpresasConsultarComponent } from './Geral/login/usuarios/empresas/empresas-consultar/empresas-consultar.component';
import { ServicosIncluirComponent } from './Geral/menus/servicos/servicos-incluir/servicos-incluir.component';
import { ServicosConsultarComponent } from './Geral/menus/servicos/servicos-consultar/servicos-consultar.component';
import { PessoasIncluirComponent } from './Geral/menus/pessoas/pessoas-incluir/pessoas-incluir.component';

const routes: Routes = [
  { path: '', component: PagInicialComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: AppLayoutComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: '', component: DashboardComponent },
      { 
        path: 'user', 
        children: [
          { path: 'incluir', component: UserIncluirComponent },
          { path: 'consultar', component: UserConsultarComponent },
          { path: 'userrelatorio', component: UserRelatorioComponent }
        ]
      },
      { 
        path: 'empresas', 
        children: [
          { path: 'incluir', component: EmpresasIncluirComponent },
          { path: 'consultar', component: EmpresasConsultarComponent },
        ]
      },
      { 
        path: 'nfse', 
        children: [
          { path: 'gerar', component: GerarNfseComponent },
          { path: 'consultar', component: UserConsultarComponent },
        ]
      },
      { 
        path: 'servicos', 
        children: [
          { path: 'incluir', component: ServicosIncluirComponent },
          { path: 'consultar', component: ServicosConsultarComponent },
        ]
      },

      { 
        path: 'pessoas', 
        children: [
          { path: 'incluir', component: PessoasIncluirComponent },
        ]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
