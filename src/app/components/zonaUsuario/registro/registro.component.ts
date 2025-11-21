import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  linkedSignal,
  OnInit,
  resource,
  ResourceRef,
  signal,
} from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import IRestMessage from '../../../models/IRestMessage';
import IRegister from '../../../models/IRegister';
import { ValidatorService } from '../../../validators/validator.service';
import { StorageService } from '../../../services/store/storageLocal.service';
import { AuthService } from '../../../services/auth/auth.service';
import Swal from 'sweetalert2';
import { AuthGoogleService } from '../../../services/auth/auth-google.service';

@Component({
  selector: 'app-registro',
  imports: [RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent implements OnInit {
  private _injector = inject(Injector);
  private _router = inject(Router);
  private _valid = inject(ValidatorService);
  private _storage = inject(StorageService);
  private _authService = inject(AuthService);
  private authGoogleService = inject(AuthGoogleService);
    
  
  //#region Señales
  nickname = signal('');
  nicknameTouched = signal(false);
  email = signal('');
  emailTouched = signal(false);
  password = signal('');
  passwordTouched = signal(false);
  rePassword = signal('');
  rePasswordTouched = signal(false);
  // Show UI
  showPassword = signal(false);
  showRePassword = signal(false);
  messageError = signal('');
  cursorSubmit = signal(false);
  private baseUrl = window.__env.backendUrl;

  
  //#endregion
  
  //#region Validaciones de los campos
  nicknameError = computed(() => {
    if (!this.nicknameTouched()) return null;
    return this._valid.basicValidation('nickname', this.nickname());
  });
  emailError = computed(() => {
    if (!this.emailTouched()) return null;
    return this._valid.basicValidation('email', this.email());
  });

  rePasswordError = computed(() => {
    if (!this.rePasswordTouched()) return null;
    return this._valid.basicValidation('rePassword', this.rePassword());
  });
  
  passwordErrors = computed(() => {
    if (!this.passwordTouched()) return null;
    return this._valid.passwordValidation(this.password());
  });
  
  passwordsMatch = computed(() => {
    return this.password() === this.rePassword() && this.password() !== '';
  });
  
  disableSubmitButton = linkedSignal(() => {
    return (
      !this.nicknameTouched() ||
      !this.emailTouched() ||
      !this.passwordTouched() ||
      !this.rePasswordTouched() ||
      this.nicknameError() ||
      this.emailError() ||
      (this.passwordErrors() && this.passwordErrors()!.length > 0) ||
      !this.passwordsMatch() ||
      this.existeNick() ||
      this.existeEmail()
    );
  });
  
  //#endregion

  //#region verificar disponibilidad de nickname
  public nicknameResource: ResourceRef<IRestMessage> = resource({
    request: this.nickname,
    loader: async ({ request, abortSignal }) => {
      try {
        const response = await fetch(
          `${this.baseUrl}/auth/nickname?nickname=${request}`,
          { method: 'GET', signal: abortSignal }
        );
        if (!response.ok) throw new Error('Error de red o servidor');
        const body = await response.json();
        console.log(body);
        return body ?? { codigo: 400, mensaje: 'Comprobando nickname...' };
      } catch (error) {
        console.error('Error al comprobar nickname:', error);
        return { codigo: 500, mensaje: 'Error al comprobar nickname' };
      }
    },
    injector: this._injector,
  });
  
  public existeNick = computed<boolean>(() => {
    const value = this.nicknameResource?.value();
    return value?.codigo === 0;
  });
  //#endregion
  
  //#region verificar disponibilidad de email
  public emailResource: ResourceRef<IRestMessage> = resource({
    request: this.email,
    loader: async ({ request, abortSignal }) => {
      try {
        const response = await fetch(
          `${this.baseUrl}/auth/email?email=${request}`,
          { method: 'GET', signal: abortSignal }
        );
        if (!response.ok) throw new Error('Error de red o servidor');
        const body = await response.json();
        console.log(body);
        return body ?? { codigo: 400, mensaje: 'Comprobando email...' };
      } catch (error) {
        console.error('Error al comprobar email: ', error);
        return { codigo: 500, mensaje: 'Error al comprobar email' };
      }
    },
    injector: this._injector,
  });
  
  public existeEmail = computed<boolean>(() => {
    const value = this.emailResource?.value();
    return value?.codigo === 0;
  });
  //#endregion
  
  //#region Envío de formulario
  handleSubmit() {
    this.disableSubmitButton.set(true);
    this.cursorSubmit.set(true); // loading
    
    const formData: IRegister = {
      nickname: this.nickname(),
      username: this.email(),
      password: this.password(),
    };
    const _resp = this._authService.register(formData);
    
    effect(() => {
      if (_resp() === null) return; // Evita null al inicio
      
      if (_resp().codigo === 0 && _resp().datos) {
        this.messageError.set('');
        console.log(_resp().datos);
        // Guardar datos en localStorage con el StorageService
        this._storage.set('activationData',{
          token: _resp().datos.token,
          code: _resp().datos.codeActivation,
          email: this.email()
        });
        Swal.fire({
          text: `Hemos enviado un correo a ${this.email()} para validar tu cuenta.`,
          customClass: {
            popup:
              'bg-principal text-red-800 rounded-2xl shadow-black shadow-lg', // fondo del modal
            confirmButton:
              'bg-btn hover:bg-yellow-600 text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
          },
          buttonsStyling: false, // necesario para que respete tus clases en el botón
          confirmButtonText: 'Aceptar'
        });
        // Navegar a validar cuenta
        this._router.navigate(['/validar-cuenta']);
      } else if (_resp().codigo !== 2) {
        // Para evitar mostrar mensaje en estado inicial (codigo 2)
        this.messageError.set(_resp().mensaje);
      }
    },{ injector: this._injector });
  }
  
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
  
  loginResponse(_resp: IRestMessage) {
    if (_resp.datos === null) return;
  
        if (_resp.codigo === 0 && _resp.datos) {
          console.log('token:-----------> ',_resp.datos.token);
          this.messageError.set('');
          //Navegar a home y almacenar datos de usuario... Cambiar flag de isLogin en store (session)
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
