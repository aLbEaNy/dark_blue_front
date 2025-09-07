import { inject, Injectable, Injector, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import IRestMessage from '../../models/IRestMessage';
import { startWith } from 'rxjs/operators';
import IGameDTO from '../../models/Game';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private http = inject(HttpClient);
  private _injector = inject(Injector);

  
  newGame(nickname: string, online: boolean) {
  return this.http.get<IRestMessage>(
    `http://localhost:8080/game/new?nickname=${nickname}&online=${online}`
  );
}
  gameDTO = signal<IGameDTO | null>(null);

}
  
  
  
  
  
  // Señal del juego actual
  // gameDTO = signal<IGameDTO | null>(null);

  // Crear partida desde backend

  // // Actualizar tablero del jugador
  // updateBoard(gameId: string, board: IBoaard) {
  //   const body = {
  //     player: this.gameDTO()?.player1,
  //     ready: true,
  //     board
  //   };

  //   const updatedGame = fetch(`http://localhost:8080/game/${gameId}/board`, {
  //     method: 'PUT',
  //     headers: {'Content-Type':'application/json'},
  //     body: JSON.stringify(body)
  //   }).then(res => res.json() as Promise<IGameDTO>);

  //   return toSignal(updatedGame, { initialValue: this.gameDTO() });
  // }

