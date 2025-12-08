import { WebSocketService } from './../webSocket/webSocket.service';
import { inject, Injectable } from '@angular/core';
import { GameService } from './game.service';
import { AIService } from './ai.service';
import { AudioService } from '../audio/audio.service';
import Game from '../../models/Game';
import { sleep } from '../../utils/board-utils';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpecialExecutorService {
  gameService = inject(GameService);
  aiService = inject(AIService);
  audioService = inject(AudioService);
  webSocketService = inject(WebSocketService);
  private http = inject(HttpClient);
  private baseUrl = window.__env.backendUrl;

  async executeSpecial(game: Game, special: string, isOnline: boolean) {
    let board =
      this.gameService.me() === 'player1'
        ? game.boardPlayer2
        : game.boardPlayer1;
    let nickname =
      this.gameService.me() === 'player1' ? game.player2 : game.player1;
    const fireRequest = { board, special, gameId: game.gameId, nickname };
    if (isOnline) {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/game/ai/fire`, fireRequest)
      );
    } else {
      // disparo local offline
    }
  }
}
