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
    GerarNfseComponent
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
    TableModule
  
    
        
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
