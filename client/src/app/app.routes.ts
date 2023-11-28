import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { userComponent } from './components/user/user.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'user', component: userComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
