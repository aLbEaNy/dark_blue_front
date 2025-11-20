import { AuthGoogleService } from '../../../services/auth/auth-google.service';

import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  linkedSignal,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { StorageService } from '../../../services/store/storageLocal.service';
import { ValidatorService } from '../../../validators/validator.service';
import IRestMessage from '../../../models/IRestMessage';
import { ForgotPasswordModalComponent } from '../forgot-password-modal/forgot-password-modal.component';
import { PerfilService } from '../../../services/game/perfil.service';


@Component({
  selector: 'app-login',
  imports: [RouterLink, ForgotPasswordModalComponent],
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
  private perfilService = inject(PerfilService);


  //#region Señales
  email = signal<string>('');
  emailTouched = signal<boolean>(false);
  password = signal<string>('');
  passwordTouched = signal<boolean>(false);
  showPassword = signal(false);
  messageError = signal('');
  showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

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

  disableSubmitButton = linkedSignal(() => {
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
    this.disableSubmitButton.set(true);

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
        this.perfilService.setPerfil(_resp.datos.perfil);
        this._storage.set('perfil', _resp.datos.perfil);
        sessionStorage.setItem('token', _resp.datos.token);
        sessionStorage.setItem('isLogin', "true");
        this._router.navigate(['/darkblue/main-game']);
      } else {
          this.messageError.set(_resp.mensaje);
      }
}
  //#endregion
}
