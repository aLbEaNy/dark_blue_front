import { WebSocketService } from './../webSocket/webSocket.service';
import { inject, Injectable } from '@angular/core';
import { GameService } from './game.service';
import { AIService } from './ai.service';
import { AudioService } from '../audio/audio.service';
import Game from '../../models/Game';
import { sleep } from '../../utils/board-utils';

@Injectable({
  providedIn: 'root'
})
export class SpecialExecutorService {

  gameService = inject(GameService);
  aiService = inject(AIService);
  audioService = inject(AudioService);
  webSocketService = inject(WebSocketService);


  async executeMultiShot(game: Game, isOnline: boolean) {
    let board = this.gameService.me() === 'player1' ? game.boardPlayer2 : game.boardPlayer1;
    for (let i = 0; i < 5; i++) {
      if (isOnline) {
        this.aiService.fire(board);
      } else {
        // disparo local offline      
      }



    }

      

  
  }

  async executeLaserShot(game: Game, isOnline: boolean) {

    let board = game.boardPlayer2;
    const positions = this.aiService.getLaserPositions(board);

    for (const pos of positions) {
      await sleep(70);

      //board = isOnline
        // ? await this.webSocketService.firePosition(pos)
        // : this.aiService.fire(board, pos);
      this.aiService.fire(board, pos);

      game = { ...game, boardPlayer2: board };
      this.gameService.setGame(game);
      this.gameService.shotsInBoard2.set([...board.shots]);
    }
  }
}
