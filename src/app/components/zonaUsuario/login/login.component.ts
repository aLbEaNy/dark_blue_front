import { AuthGoogleService } from './../../../services/auth-google.service';

import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { StorageService } from '../../../services/storage.service';
import { ValidatorService } from '../../../services/validator.service';
import IRestMessage from '../../../models/IRestMessage';


@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private _injector = inject(Injector);
  private _router = inject(Router);
  private _valid = inject(ValidatorService);
  private _storage = inject(StorageService);
  private _authService = inject(AuthService);
  private authGoogleService = inject (AuthGoogleService);

  //#region Señales
  email = signal<string>('');
  emailTouched = signal<boolean>(false);
  password = signal<string>('');
  passwordTouched = signal<boolean>(false);
  showPassword = signal(false);
  messageError = signal('');

  //#endregion
  
  //#region Validaciones de los campos

  emailError = computed(() => {
    if (!this.emailTouched()) return null;
    return this._valid.basicValidation('email', this.email());
  });

  passwordErrors = computed(() => {
    if (!this.passwordTouched()) return null;
    return this._valid.passwordValidation(this.password());
  });

  disableSubmitButton = computed(() => {
    return (
      !this.emailTouched() ||
      !this.passwordTouched() ||
      this.emailError() ||
      (this.passwordErrors() && this.passwordErrors()!.length > 0)
    );
  });

  //#endregion
  
  //#region login Google
  ngOnInit(): void {
    this.authGoogleService.initialize();
  }

  loginWithGoogle() {
    this.authGoogleService.login();

    effect(() => {
      const _resp = this.authGoogleService.datos
      this.loginResponse(_resp());
    }, {
      injector: this._injector

    });

  }

  //#endregion

  //#region Envío de formulario
  

  handleSubmit() {

    const _resp = this._authService.login(this.email(), this.password());

    effect(() => {
      this.loginResponse(_resp());
      
    }, 
    { injector: this._injector }
  );
  
}
loginResponse(_resp: IRestMessage) {
  if (_resp.datos === null) return;

      if (_resp.codigo === 0 && _resp.datos) {
        console.log('token:-----------> ',_resp.datos.token);
        this.messageError.set('');
        //Navegar a home y almacenar datos de usuario... Cambiar flag de isLogin en store (session)
        this._storage.set('perfil', _resp.datos.perfil);
        this._storage.set('token', _resp.datos.token);
        sessionStorage.setItem('isLogin', "true");
        this._router.navigate(['/home']);
      } else {
          this.messageError.set(_resp.mensaje);
      }
}


  //#endregion
}
