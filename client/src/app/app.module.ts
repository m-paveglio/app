import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms'; // Importe o ReactiveFormsModule
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './services/auth.guards.service';
import { AuthService } from './services/auth.service';
import { AppRoutingModule } from './app.routes';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,

  ],
  providers: [AuthService, AuthGuard],
  bootstrap: [],
})
export class AppModule {}
