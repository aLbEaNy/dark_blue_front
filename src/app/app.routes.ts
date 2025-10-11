import { Routes } from '@angular/router';
import { HomeComponent } from './components/zonaPortal/home/home.component';
import { RegistroComponent } from './components/zonaUsuario/registro/registro.component';
import { LoginComponent } from './components/zonaUsuario/login/login.component';
import { ValidarCuentaComponent } from './components/zonaUsuario/validar-cuenta/validar-cuenta.component';
import { authGuard } from './guards/auth.guard';
import { MenuComponent } from './components/zonaPortal/game/menu/menu.component';
import { MainGameComponent } from './components/zonaPortal/game/main-game/main-game.component';
import { OptionsComponent } from './components/zonaUsuario/options/options.component';

export const routes: Routes = [
     {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},

    { path: 'registro', component: RegistroComponent },
    { path: 'login', component: LoginComponent },
    { path: 'validar-cuenta', component: ValidarCuentaComponent },
    
    // 🔒 todas las de paginas que cuelgan de /darkblue
  {
    path: 'darkblue',
    canActivate: [authGuard], 
    children: [
      { path: 'menu', component: MenuComponent },
      { path: 'main-game', component: MainGameComponent },
      { path: 'options', component: OptionsComponent }      
    ]
  }

];
