import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { BrowserModule, provideClientHydration} from '@angular/platform-browser';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PagInicialComponent } from './pag-inicial/pag-inicial.component';
import { LoginComponent } from './Geral/login/login.component';
import { DashboardComponent } from './Geral/dashboard/dashboard.component';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { NgxMaskModule } from 'ngx-mask';
import { AppLayoutModule } from './layout/app.layout.module';
import { UserConsultarComponent } from './Geral/login/usuarios/user/user-consultar/user-consultar.component';
import { UserIncluirComponent } from './Geral/login/usuarios/user/user-incluir/user-incluir.component';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import { UserRelatorioComponent } from './Geral/login/usuarios/user/user-relatorio/user-relatorio.component';
import { GerarNfseComponent } from './Geral/menus/nfse/enviar/gerar-nfse.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { EmpresasIncluirComponent } from './Geral/login/usuarios/empresas/empresas-incluir/empresas-incluir.component';
import { EmpresasConsultarComponent } from './Geral/login/usuarios/empresas/empresas-consultar/empresas-consultar.component';
import { TabViewModule } from 'primeng/tabview'
import { DialogModule } from 'primeng/dialog';
import { ServicosIncluirComponent } from './Geral/menus/servicos/servicos-incluir/servicos-incluir.component';
import { ServicosConsultarComponent } from './Geral/menus/servicos/servicos-consultar/servicos-consultar.component';
import { PessoasIncluirComponent } from './Geral/menus/pessoas/pessoas-incluir/pessoas-incluir.component';
import { PessoasConsultarComponent } from './Geral/menus/pessoas/pessoas-consultar/pessoas-consultar.component';
import { ComandasIncluirComponent } from './Geral/menus/comandas/comandas-incluir/comandas-incluir.component';
import { ComandasConsultarComponent } from './Geral/menus/comandas/comandas-consultar/comandas-consultar.component';
import { CarouselModule } from 'primeng/carousel';
import { FileUploadModule } from 'primeng/fileupload';
import { WebserviceConsultarComponent } from './Geral/menus/webservice/consultar/webservice-consultar.component';





@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [
    AppComponent,
    PagInicialComponent,
    LoginComponent,
    DashboardComponent,
    UserConsultarComponent,
    UserIncluirComponent,
    UserRelatorioComponent,
    GerarNfseComponent,
    EmpresasIncluirComponent,
    EmpresasConsultarComponent,
    ServicosIncluirComponent,
    ServicosConsultarComponent,
    PessoasIncluirComponent,
    PessoasConsultarComponent,
    ComandasIncluirComponent,
    ComandasConsultarComponent,
    WebserviceConsultarComponent
    
    
        ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxMaskModule.forRoot(),
    AppLayoutModule,
    FloatLabelModule,
    ButtonModule,
    DropdownModule,
    MatDialogModule,
    ToastModule,
    ConfirmDialogModule,
    TableModule,
    TabViewModule,
    DialogModule,
    CarouselModule,
    FileUploadModule
  
    
        
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    MessageService,
    ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
