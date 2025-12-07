import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { GameService } from '../../../../services/game/game.service';
import { formatPosition, parsePosition } from '../../../../utils/board-utils';
import { NgClass, NgStyle } from '@angular/common';
import Submarine from '../../../../models/Submarine';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-online-board-atack',
  imports: [NgStyle, NgClass],
  templateUrl: './online-board-atack.component.html',
  styleUrl: './online-board-atack.component.css',
})
export class OnlineBoardAtackComponent{
  gameService = inject(GameService);
  private sub?: Subscription;
  disableFire = input();
  updateBoard = input();
  firePlayer = output<string>();

  shotsInBoard1 = signal(this.gameService.shotsInBoard1());
  shotsInBoard2 = signal(this.gameService.shotsInBoard2());

  //Referencia al tablero
  readonly BOARD_SIZE = 10;
  cellSize = 34;
  cells = Array.from({ length: 100 }, (_, i) => i);

  isMyTurn = computed(() => {
    return this.gameService.isMyTurn();
  });

  boardComputed = computed(() => {
    return this.gameService.getCurrentBoard();
  });
  
  constructor(){
    effect(() => {
      if(this.updateBoard()){
        this.shotsInBoard1.set(this.gameService.gameDTO()?.boardPlayer1.shots!);
        this.shotsInBoard2.set(this.gameService.gameDTO()?.boardPlayer2.shots!);
        console.log('|---->> Recibo orden del padre de actualizar...');
      }
    });
  }

  fire(cellIndex: number) {
    if (this.disableFire()) return;
    const x = Math.floor(cellIndex / this.BOARD_SIZE);
    const y = cellIndex % this.BOARD_SIZE;
    const pos = formatPosition(x, y);
    // Emitir coordenada al padre
    this.firePlayer.emit(pos);
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

  shotMap = computed(() => {
    const shotsInBoard1 = this.shotsInBoard1();
    const shotsInBoard2 = this.shotsInBoard2();
    const map: Record<number, 'HIT' | 'MISS'> = {};
    const shots = this.boardComputed()?.shots ?? [];
    for (const shot of shots) {
      const pos = this.parsePosition(shot.position);
      const index = pos.row * this.BOARD_SIZE + pos.col;
      map[index] = shot.result;
    }
    return map;
  });
}
