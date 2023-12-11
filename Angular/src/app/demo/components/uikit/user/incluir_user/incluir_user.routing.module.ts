import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IncluirUserComponent } from './incluir_user.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: IncluirUserComponent }
	])],
	exports: [RouterModule]
})
export class InlcuirUserRoutingModule { }
