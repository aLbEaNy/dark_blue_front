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


  async executeX2Shot(player: 'player1' | 'player2') {
    this.audioService.play('x2', '/audio/x2.mp3');
    // Habilitas otro disparo
  }


  async executeMultiShot(game: Game, count: number, isOnline: boolean) {
    let board = game.boardPlayer2;
    let hit = false;
    let miss = false;
    let destroyed = false;

    for (let i = 0; i < count; i++) {

      if (isOnline) {
        // pedir disparo al backend
        //board = await this.webSocketService.sendMultishot();
      } else {
        // disparo local offline
        board = this.aiService.fire(board);
      }

      game = { ...game, boardPlayer2: board };
      this.gameService.setGame(game);
      this.gameService.shotsInBoard2.set([...board.shots]);

      const last = board.shots.at(-1)!;

      if (last.result === 'HIT') hit = true;
      if (last.result === 'MISS') miss = true;

      if (board.submarines.some(s => s.positions.includes(last.position) && s.isDestroyed))
        destroyed = true;
    }

    if (hit) this.audioService.play('hitSound', '/audio/hitSound.mp3');
    if (miss) this.audioService.play('missSound', '/audio/missSound.mp3');
    if (destroyed) this.audioService.play('destroyedSound', '/audio/destroyedSound.mp3');
  }

  async executeLaser(game: Game, isOnline: boolean) {
    this.audioService.play('laserShot', '/audio/laserShot.mp3');

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
