import { Routes } from '@angular/router';
import { HomeComponent } from './components/zonaPortal/home/home.component';
import { RegistroComponent } from './components/zonaUsuario/registro/registro.component';
import { LoginComponent } from './components/zonaUsuario/login/login.component';
import { ValidarCuentaComponent } from './components/zonaUsuario/validar-cuenta/validar-cuenta.component';

export const routes: Routes = [
     {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},

    { path: 'registro', component: RegistroComponent },
    { path: 'login', component: LoginComponent },
    { path: 'validar-cuenta', component: ValidarCuentaComponent },
];
