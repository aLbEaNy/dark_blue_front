import { Component, computed, inject } from '@angular/core';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { GameService } from '../../../../services/game/game.service';
import { formatPosition, parsePosition } from '../../../../utils/board-utils';
import { NgStyle } from '@angular/common';
import Submarine from '../../../../models/Submarine';

@Component({
  selector: 'app-board-atack',
  imports: [NgStyle],
  templateUrl: './board-atack.component.html',
  styleUrl: './board-atack.component.css'
})
export class BoardAtackComponent {
  storageService = inject(StorageService);
  gameService = inject(GameService);

  //Referencia al tablero
  readonly BOARD_SIZE = 10;
  cellSize = 34;
  cells = Array.from({ length: 100 }, (_, i) => i);

  // El tablero que me da el servicio según turno
  board = this.gameService.getCurrentBoard;
  isMyTurn = this.gameService.isMyTurn;


  fire(cellIndex: number) {
    console.log('Disparo en celda:', cellIndex);
    console.log('Es mi turno? :', this.isMyTurn());
    console.log('Board actual:', this.board());
    const x = Math.floor(cellIndex / this.BOARD_SIZE);
    const y = cellIndex % this.BOARD_SIZE;
    this.gameService.shot(formatPosition(x, y));
    
  }
  parsePosition(pos: string) {
      return parsePosition(pos);
    }

  getSubmarineStyle(sub: Submarine) {
    const pos = this.parsePosition(sub.positions[0]);
    return {
      left: pos.col * this.cellSize + 'px',
      top: pos.row * this.cellSize + 'px',
      width: sub.isHorizontal
        ? sub.sizeSub * this.cellSize + 'px'
        : this.cellSize + 'px',
      height: sub.isHorizontal
        ? this.cellSize + 'px'
        : sub.sizeSub * this.cellSize + 'px',
    };
  }

}
