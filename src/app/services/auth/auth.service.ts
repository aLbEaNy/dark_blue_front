import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector, Signal } from '@angular/core';
import { lastValueFrom, startWith } from 'rxjs';
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

  private baseUrl = window.__env.backendUrl;

  /**
   * Registro de usuario. Devuelve una señal con la respuesta.
   * @param data Datos del registro
   */
  register(data: IRegister): Signal<IRestMessage> {
    return toSignal(
      this.http
        .post<IRestMessage>(`${this.baseUrl}/auth/register`, data
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
        .post<boolean>(`${this.baseUrl}/auth/validateCodeActivation`,
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
        .get<IRestMessage>(`${this.baseUrl}/auth/resendToken?username=${email}&activation=${activation}`)
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
          .post<IRestMessage>(`${this.baseUrl}/auth/login`,
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
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  nicknameExists(nickname: string) {
    return lastValueFrom(
      this.http.get<IRestMessage>(`${this.baseUrl}/auth/nickname?nickname=${nickname}`));
  }
  deleteAccount(username: string){
    return lastValueFrom(
      this.http.delete<boolean>(`${this.baseUrl}/auth?username=${username}`))
  }
  forgotPassword(email: string) {
    return lastValueFrom( 
      this.http.get<IRestMessage>(`${this.baseUrl}/auth/forgotPassword?email=${email}`)
    )}

}

