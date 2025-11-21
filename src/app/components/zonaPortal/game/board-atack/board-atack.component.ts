import {
  Component,
  computed,
  inject,
  output,
  OnInit,
  OnDestroy,
  input,
} from '@angular/core';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { GameService } from '../../../../services/game/game.service';
import { formatPosition, parsePosition } from '../../../../utils/board-utils';
import { NgClass, NgStyle } from '@angular/common';
import Submarine from '../../../../models/Submarine';
import { PerfilService } from '../../../../services/game/perfil.service';
import { SpecialService } from '../../../../services/game/special.service';

@Component({
  selector: 'app-board-atack',
  imports: [NgStyle, NgClass],
  templateUrl: './board-atack.component.html',
  styleUrl: './board-atack.component.css',
})
export class BoardAtackComponent implements OnInit, OnDestroy {
  storageService = inject(StorageService);
  gameService = inject(GameService);
  perfilService = inject(PerfilService);
  specialService = inject(SpecialService);
  perfil = this.perfilService.perfil();
  disableFire = input();

  //Referencia al tablero
  readonly BOARD_SIZE = 10;
  cellSize = 34;
  cells = Array.from({ length: 100 }, (_, i) => i);

  game = computed(() => {
    return this.gameService.gameDTO();
  });

  isMyTurn = computed(() => {
    return this.gameService.isMyTurn();
  });

  boardComputed = computed(() => {
    return this.gameService.getCurrentBoard();
  });
  firePlayer = output<string>();

  ngOnInit(): void {
    const perfil = this.perfil;
    perfil.stats.currentStartTime = Date.now();
    this.perfilService.setPerfil(perfil);
    this.perfilService.updatePerfil(perfil);
  }

  ngOnDestroy(): void {
    const perfil = this.perfil;
    const now = Date.now();

    // Evitar errores si por alguna razón no se había inicializado
    if (perfil.stats.currentStartTime) {
      const sessionTime = now - perfil.stats.currentStartTime;
      perfil.stats.playTime = (perfil.stats.playTime ?? 0) + sessionTime;
      perfil.stats.currentStartTime = undefined;
    }
    this.perfilService.setPerfil(perfil);
    this.perfilService.updatePerfil(perfil);
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
    const shotsInBoard1 = this.gameService.shotsInBoard1();
    const shotsInBoard2 = this.gameService.shotsInBoard2();
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
