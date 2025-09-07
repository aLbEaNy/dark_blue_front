import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  QueryList,
  signal,
  ViewChildren,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../../services/store/storageLocal.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-validar-cuenta',
  imports: [],
  templateUrl: './validar-cuenta.component.html',
  styleUrl: './validar-cuenta.component.css',
})
export class ValidarCuentaComponent {
  _storage = inject(StorageService);
  _router = inject(Router);
  _authService = inject(AuthService);
  private _injector = inject(Injector);

  disableSubmit = signal<boolean>(false);
  disableResend = signal<boolean>(false);



  @ViewChildren('codigo0, codigo1, codigo2, codigo3, codigo4, codigo5')
  inputs!: QueryList<ElementRef>;

 // computed que siempre se refresca leyendo de storage
 // {token, code, email}
 activationDataComputed = computed(() => {
    return this._storage.activationData()
});
  respValid = signal< boolean | null | undefined >(null);
  errorMsg = signal<string>('');


  moverAlSiguiente(event: any, index: number): void {
    const input = event.target;
    const value = input.value;

    if (value && index < 5) {
      this.inputs.toArray()[index + 1].nativeElement.focus();
    } else if (!value && index > 0) {
      this.inputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  checkCodeActivation(): void {
  this.disableSubmit.set(true);  
  const _token = this.activationDataComputed()?.token;
  const _code = this.inputs.toArray().map(i => i.nativeElement.value).join('');
  const _email = this.activationDataComputed()?.email;

  const resultado = this._authService.validateCodeActivation(_token!, _code!, _email!);

  effect(() => {
    const _resp = resultado(); // aquí ya se actualiza cuando llega la respuesta

    if (_resp == null) return; // Evita null al inicio
        if (_resp === false) {
          //No crea dependencia del effect
          untracked(() => {
          this.errorMsg.set('* El código ingresado es incorrecto.');
          this.disableSubmit.set(false);
          this.disableResend.set(false);
          });
          return;
        }        
        if (_resp) {
          untracked(() => {
          this.errorMsg.set('');
          Swal.fire({
            title: 'Activación de cuenta',
            text: `La cuenta ${this.activationDataComputed()?.email} ha sido activada correctamente`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
        });
          this._storage.remove('activationData');
          this._router.navigate(['/login']);
        }
  }, { injector: this._injector });
}

  resendCodeActivation(): void {
    this.disableResend.set(true);
    
    const _resp = this._authService.resendTokenOrTokenAndCode(
      this.activationDataComputed()?.email!,
      true
    );

    effect(() => {
      const resp = _resp(); // aquí ya se actualiza cuando llega la respuesta

        if (resp.datos === null) return; // Evita null al inicio

        if (resp.codigo === 0 && _resp().datos) {
          console.log(_resp().datos);
          untracked(() => {
            
            // Guardar datos en localStorage con el StorageService
            this._storage.set('activationData', {
              token: resp.datos.token,
              code: resp.datos.code,
              email: this.activationDataComputed()?.email!,
            });
  
            Swal.fire({
              title: 'Reenvío de código de activación',
              text: `Hemos enviado un correo a ${
                this.activationDataComputed()?.email
              } para validar tu cuenta.`,
              icon: 'info',
              confirmButtonText: 'Aceptar',
            });
            //borro los inputs y errores
            this.inputs.toArray().forEach((input) => {
              input.nativeElement.value = '';
            });
            this.errorMsg.set('');

          });
        } 
      },
      { injector: this._injector }
    );
  }
}