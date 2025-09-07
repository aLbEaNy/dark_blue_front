import { Component, inject, computed, effect } from '@angular/core';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { GameService } from '../../../../services/game/game.service';
import { parsePosition } from '../../../../utils/board-utils';

@Component({
  selector: 'app-board',
  imports: [],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent {
  storageService = inject(StorageService);
  gameService = inject(GameService);

  cells = Array.from({ length: 100 }, (_, i) => i);
  cellSize = 34; // píxeles

  // tablero según si soy player1 o player2
  board = computed(() => {
    const dto = this.gameService.gameDTO();
    if (!dto) return null;
    return dto.me === 'player1' ? dto.boardPlayer1 : dto.boardPlayer2;
  });

  getX(pos: string) {
    return parsePosition(pos).col * this.cellSize;
  }

  getY(pos: string) {
    return parsePosition(pos).row * this.cellSize;
  }

  constructor() {
    effect(() => {
      const dto = this.gameService.gameDTO();
      console.log('EFFECT me:', dto?.me);
      console.log('EFFECT BOARD_PLAYER1: ', dto?.boardPlayer1.submarines);
      console.log('EFFECT BOARD_PLAYER1_SHOTS: ', dto?.boardPlayer1.shots);
      console.log('EFFECT BOARD_PLAYER2: ', dto?.boardPlayer2.submarines);
      console.log('EFFECT BOARD_PLAYER2_SHOTS: ', dto?.boardPlayer2.shots);
    });
  }


}
