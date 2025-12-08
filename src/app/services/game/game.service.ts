import { firstValueFrom } from 'rxjs';
import {
  computed,
  inject,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import IRestMessage from '../../models/IRestMessage';
import Game from '../../models/Game';
import { StorageService } from '../store/storageLocal.service';
import Shot from '../../models/Shot';
import GameMessage from '../../models/GameMessage';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private http = inject(HttpClient);
  storage = inject(StorageService);
  gameDTO = signal<Game | null>(this.storage.get('gameDTO') || null);
  perfil = this.storage.get<any>('perfil');
  private baseUrl = window.__env.backendUrl;

  me = computed(() => {
    const g = this.gameDTO();
    if (!g) return;
    return g.player1 === this.perfil.nickname ? 'player1' : 'player2'; //Player1 en modo Historia
  });

  shotsInBoard1 = signal<Shot[]>([]);
  shotsInBoard2 = signal<Shot[]>([]);

  
  // para saber si es mi turno
  isMyTurn = linkedSignal(() => {
    const g = this.gameDTO();
    if (!g) return;
    return g.turn === this.me();
  });
  
  // qué tablero pinto según si ataco o defiendo
  getCurrentBoard = linkedSignal(() => {
    const g = this.gameDTO();
    if (!g) return null;
    return g.turn === 'player1' ? g.boardPlayer2 : g.boardPlayer1;
  });
  
  myBoard = computed(() => {
    const g = this.gameDTO();
    if (!g) return null;
    return this.me() === 'player1' ? g.boardPlayer1 : g.boardPlayer2;
  });
  
  newGame(nickname: string, online: boolean, gameId: string) {
    return firstValueFrom (this.http.get<IRestMessage>(
      `${this.baseUrl}/game/new?nickname=${nickname}&online=${online}&gameId=${gameId}`
    ));
  }
  getGame(gameId: string) {
    return firstValueFrom(this.http.get<IRestMessage>(
      `${this.baseUrl}/game/getGame/${gameId}`
    ));
  }
  async setGame(game: Game) {
    this.gameDTO.set(game);
    this.storage.set('gameDTO', game); // persistencia en local
  }

  updateGame(game: Game, changeTurn: boolean = false) {
    return firstValueFrom(
      this.http.post<IRestMessage>(`${this.baseUrl}/game/update`, game)
    );
  }
  changeTurn(gameId: string){
    return firstValueFrom(
      this.http.get<boolean>(`${this.baseUrl}/game/changeTurn/${gameId}`)
    );
  }
  shoot(gameId: string, me: string, pos: string) { 
     return firstValueFrom(
      this.http.post<GameMessage>(`${this.baseUrl}/game/shoot`,{gameId, me, pos})
    );
  }

  cancelGame(gameId: string) {
    return firstValueFrom( this.http.delete<IRestMessage>(
      `${this.baseUrl}/game/${gameId}`
    ));
  }
  exitGame(gameId: string) {
    return firstValueFrom(this.http.get<boolean>(
      `${this.baseUrl}/game/exit/${gameId}`
    ));
  }
}
