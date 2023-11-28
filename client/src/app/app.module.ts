import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importe o ReactiveFormsModule
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './services/auth.guards.service';
import { AuthService } from './services/auth.service';
import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { UserService } from './services/user.service';
FormsModule

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [AuthService, AuthGuard, UserService],
  bootstrap: [AppComponent],
})
export class AppModule {}
