import { computed, inject, Injectable, Injector, linkedSignal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import IRestMessage from '../../models/IRestMessage';
import Game from '../../models/Game';
import { StorageService } from '../store/storageLocal.service';
import Shot from '../../models/Shot';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private http = inject(HttpClient);
  storage = inject(StorageService);
  private _injector = inject(Injector);
  gameDTO = signal<Game | null>(null);

  me = signal('player1'); //es el player1 para modo historia
  shotsInBoard1 = signal<Shot[]>([]);
  shotsInBoard2 = signal<Shot[]>([]);

  setGame(game: Game) {
  this.gameDTO.set(game);
  this.storage.set('gameDTO', game); // persistencia
}

  
  // para saber si es mi turno
  isMyTurn = linkedSignal(() => {
    const g = this.gameDTO();
    if (!g) return;
    console.log('Comparando turn vs me BOOLEAN:', g.turn, this.me()); // 👈 debug
    return g.turn === this.me();
  });

  // qué tablero pinto según si ataco o defiendo
  getCurrentBoard = linkedSignal(() => {
    const g = this.gameDTO();
    if (!g) return null;
    console.log('CURRENT_BOARD' );
    return g.turn === 'player1' ? g.boardPlayer2 : g.boardPlayer1;  
  });

  myBoard = computed(() => {
    const g = this.gameDTO();
    if (!g) return null;
    return this.me() === 'player1' ? g.boardPlayer1 : g.boardPlayer2;
  });

  
  newGame(nickname: string, online: boolean, gameId: string ='') {
  return this.http.get<IRestMessage>(
    `http://localhost:8080/game/new?nickname=${nickname}&online=${online}&gameId=${gameId}`
  );
}

  updateGame(game: Game) {
    return this.http.post<IRestMessage>(
      'http://localhost:8080/game/update',
      game
    );
  }
  cancelGame(gameId: string) {
    return this.http.delete<IRestMessage>(
      `http://localhost:8080/game/${gameId}`
    );
  }

}
