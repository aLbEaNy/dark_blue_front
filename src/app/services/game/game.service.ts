import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import IRestMessage from '../../models/IRestMessage';
import Game from '../../models/Game';
import { StorageService } from '../store/storageLocal.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private http = inject(HttpClient);
  private _injector = inject(Injector);
  gameDTO = signal<Game | null>(null);

  me = signal('player1'); //es el player1 para modo historia
  storage = inject(StorageService);

  setGame(game: Game) {
  this.gameDTO.set(game);
  this.storage.set('gameDTO', game); // persistencia
}

  
  // computed para saber si es mi turno
  isMyTurn = computed(() => {
    const g = this.gameDTO();
    if (!g) return false;
    console.log('Comparando turn vs me:', g.turn, this.me()); // 👈 debug
    return g.turn === this.me();
  });

  // qué tablero pinto según si ataco o defiendo
  getCurrentBoard = computed(() => {
    const g = this.gameDTO();
    if (!g) return null;
    if (this.isMyTurn()) {
      return this.me() === 'player1' ? g.boardPlayer2 : g.boardPlayer1;
    } else {
      return this.me() === 'player1' ? g.boardPlayer1 : g.boardPlayer2;
    }
  });

  myBoard = computed(() => {
    const g = this.gameDTO();
    if (!g) return null;
    return this.me() === 'player1' ? g.boardPlayer1 : g.boardPlayer2;
  });



  // acción de disparo
  shot(coord: string) {
    // aquí llamas al backend con HttpClient o WebSocket
    console.log(`Disparo en (${coord})`);
  }
  
  newGame(nickname: string, online: boolean) {
  return this.http.get<IRestMessage>(
    `http://localhost:8080/game/new?nickname=${nickname}&online=${online}`
  );
}

}
