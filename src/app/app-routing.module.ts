import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { MakeCallComponent } from './make-call/make-call.component';

const routes: Routes = [
  // {path: 'app-make-call', component: MakeCallComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
