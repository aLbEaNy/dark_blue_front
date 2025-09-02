import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector, Signal } from '@angular/core';
import { startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import IRegister from '../../models/IRegister';
import IRestMessage from '../../models/IRestMessage';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private _injector = inject(Injector);

  private router = inject(Router);


  /**
   * Registro de usuario. Devuelve una señal con la respuesta.
   * @param data Datos del registro
   */
  register(data: IRegister): Signal<IRestMessage> {
    return toSignal(
      this.http
        .post<IRestMessage>('http://localhost:8080/auth/register', data
        )
        .pipe(
          startWith({
            codigo: 2,
            mensaje: '...esperando respuesta del server desde auth.service...',
            datos: null,
          })
        ),
      { injector: this._injector, requireSync: true }
    );
  }

  validateCodeActivation(token: string, code: string, email: string):Signal<boolean | undefined> {
    
    return toSignal(
      this.http
        .post<boolean>('http://localhost:8080/auth/validateCodeActivation',
            {
                token,
                code,
                email
            },
            { headers: { 'Content-Type': 'application/json' } }
        )
        .pipe( 
            startWith(
            false
          )
        ),
      { injector: this._injector }
    );
  }
  
  resendTokenOrTokenAndCode(email: string, activation: boolean): Signal<IRestMessage> {
    return toSignal(
      this.http
        .get<IRestMessage>(`http://localhost:8080/auth/resendToken?username=${email}&activation=${activation}`)
        .pipe(
          startWith({
            codigo: 2,
            mensaje: '...esperando respuesta del server desde auth.service...',
            datos: null,
          })
        ),
      { injector: this._injector, requireSync: true }
    );
  }

  login(email: string, password: string): Signal<IRestMessage> {
       return toSignal(
        this.http
          .post<IRestMessage>('http://localhost:8080/auth/login',
              {
                  username:email, password
              },
              { headers: { 'Content-Type': 'application/json' } }
          )
          .pipe( 
              startWith({
                codigo: 2,
                mensaje: '...esperando respuesta del server desde auth.service...',
                datos: null,
              }
            )
          ),
        { injector: this._injector, requireSync: true }
      );
    }
  isLogin():Boolean {
    return !!sessionStorage.getItem('isLogin');// (!!) Para evitar problema con null y sea false
  }
  logout(){
    sessionStorage.removeItem('isLogin');
    this.router.navigate(['/login']);
  }

}

