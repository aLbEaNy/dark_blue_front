import { Routes } from '@angular/router';
import { HomeComponent } from './components/zonaPortal/home/home.component';
import { RegistroComponent } from './components/zonaUsuario/registro/registro.component';
import { LoginComponent } from './components/zonaUsuario/login/login.component';

export const routes: Routes = [
     {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},

    { path: 'Registro', component: RegistroComponent },
    { path: 'Login', component: LoginComponent },
];
