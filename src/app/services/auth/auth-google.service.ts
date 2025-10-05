import { computed, effect, inject, Injectable, Injector, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import IRestMessage from '../../models/IRestMessage';
import { startWith } from 'rxjs';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthGoogleService {
  private http = inject(HttpClient);
  private _injector = inject(Injector);
  private clientId = '1076915317631-ogahf76hk4m8dlhuibsdnr6fv27kph7h.apps.googleusercontent.com';
  private client: any;
  public datos = signal<IRestMessage>({codigo: 2, mensaje: '...esperando respuesta del server desde auth.service...', datos: null});
  private baseUrl = window.__env.backendUrl;


  constructor() {}

  initialize() {
    this.client = google.accounts.oauth2.initCodeClient({
      client_id: this.clientId,
      scope: 'email profile openid',
      ux_mode: 'popup',
      callback: (response: any) => this.handleCredentialResponse(response)
    });
  }

  login() {
    if (this.client) {
      this.client.requestCode(); // abre popup de Google
    }
  }

  private handleCredentialResponse(response: any) {
  console.log('Código recibido de Google:', response.code);

  const userSignal = toSignal(
      this.http.post<IRestMessage>(`${this.baseUrl}/auth/google`, { code: response.code })
      .pipe(
                startWith({
                  codigo: 2,
                  mensaje: '...esperando respuesta del server desde auth.service...',
                  datos: null,
                })
              ),
      { injector: this._injector, requireSync: true }
    );
    effect(() => {
      const userData = userSignal();
      if (userData?.codigo === 0) {
        console.log('Usuario autenticado:', userData.datos.token)
        // Lógica con usuario autenticado
        untracked(() => { 
          this.datos.set(userData);
        });        
      }
    }, { injector: this._injector });
  }
}