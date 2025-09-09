// board.component.ts
import { Component, inject, computed, effect } from '@angular/core';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { GameService } from '../../../../services/game/game.service';
import { formatPosition, parsePosition } from '../../../../utils/board-utils';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  imports: [DragDropModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent {
  storageService = inject(StorageService);
  gameService = inject(GameService);

  readonly BOARD_SIZE = 10;
  cellSize = 34;
  cells = Array.from({ length: 100 }, (_, i) => i);

  // Computed board según si soy player1 o player2
  board = computed(() => {
    const dto = this.gameService.gameDTO();
    if (!dto) return null;
    return dto.me === 'player1' ? dto.boardPlayer1 : dto.boardPlayer2;
  });

  constructor() {
    // Logs de board para depuración
    effect(() => {
      const dto = this.gameService.gameDTO();
      console.log('EFFECT me:', dto?.me);
      console.log('EFFECT BOARD_PLAYER1:', dto?.boardPlayer1.submarines);
      console.log('EFFECT BOARD_PLAYER2:', dto?.boardPlayer2.submarines);
    });
  }

  parsePosition(pos: string) {
    return parsePosition(pos);
  }

  // Solo se hace snap al soltar, no mientras se arrastra
  dropSubmarine(event: CdkDragEnd, sub: any) {
  const boardEl = document.getElementById('board');
  if (!boardEl) return;

  const dragEl = event.source.element.nativeElement as HTMLElement;

  // posición absoluta dentro del tablero
  const boardRect = boardEl.getBoundingClientRect();
  const dragRect = dragEl.getBoundingClientRect();

  let x = dragRect.left - boardRect.left;
  let y = dragRect.top - boardRect.top;

  // columna/fila aproximada
  let col = Math.round(x / this.cellSize);
  let row = Math.round(y / this.cellSize);

  // clamp como antes
  if (sub.isHorizontal) {
    if (col < 0) col = 0;
    if (col + sub.sizeSub > this.BOARD_SIZE) col = this.BOARD_SIZE - sub.sizeSub;
    if (row < 0) row = 0;
    if (row >= this.BOARD_SIZE) row = this.BOARD_SIZE - 1;
  } else {
    if (col < 0) col = 0;
    if (col >= this.BOARD_SIZE) col = this.BOARD_SIZE - 1;
    if (row < 0) row = 0;
    if (row + sub.sizeSub > this.BOARD_SIZE) row = this.BOARD_SIZE - sub.sizeSub;
  }

  if (!this.isPositionFree(sub, row, col)) {
  console.log('¡Movimiento inválido! Se superpone con otro submarino.');
  event.source.reset();
  return;
  }

  // reconstruir posiciones
  const newPositions = [];
  for (let i = 0; i < sub.sizeSub; i++) {
    if (sub.isHorizontal) newPositions.push(formatPosition(row, col + i));
    else newPositions.push(formatPosition(row + i, col));
  }

  sub.positions = newPositions;

  console.log('--- DRAG END ---');
  console.log('Submarino:', sub.id);
  console.log('Posición tablero (px):', x, y);
  console.log('Columna/fila calculada:', col, row);
  console.log('Nuevas posiciones:', sub.positions);
  console.log('Board me actualizado (player1): ', this.board());
  // Reset snap visual
  event.source.reset();
}

isPositionFree(sub: any, row: number, col: number): boolean {
  const boardSubs = this.board()?.submarines || [];
  const newPositions: string[] = [];

  for (let i = 0; i < sub.sizeSub; i++) {
    if (sub.isHorizontal) newPositions.push(formatPosition(row, col + i));
    else newPositions.push(formatPosition(row + i, col));
  }

  // Comprobar si alguna posición nueva coincide con otro submarino
  for (const other of boardSubs) {
    if (other.id === sub.id) continue; // no comparar con sí mismo
    for (const pos of other.positions) {
      if (newPositions.includes(pos)) return false;
    }
  }

  return true;
}

rotateSubmarine(sub: any) {
  const oldOrientation = sub.isHorizontal;
  sub.isHorizontal = !sub.isHorizontal; // cambiar orientación

  // recalcular posiciones
  const firstPos = parsePosition(sub.positions[0]);
  let row = firstPos.row;
  let col = firstPos.col;

  // Limitar dentro del tablero después de rotar
  if (sub.isHorizontal && col + sub.sizeSub > this.BOARD_SIZE) {
    col = this.BOARD_SIZE - sub.sizeSub;
  } else if (!sub.isHorizontal && row + sub.sizeSub > this.BOARD_SIZE) {
    row = this.BOARD_SIZE - sub.sizeSub;
  }

  if (!this.isPositionFree(sub, row, col)) {
    // si no cabe, revertimos
    sub.isHorizontal = oldOrientation;
    console.log('Rotación inválida, posiciones ocupadas.');
    return;
  }

  const newPositions: string[] = [];
  for (let i = 0; i < sub.sizeSub; i++) {
    if (sub.isHorizontal) newPositions.push(formatPosition(row, col + i));
    else newPositions.push(formatPosition(row + i, col));
  }
  sub.positions = newPositions;

  console.log('Submarino rotado:', sub.id, 'Nueva orientación:', sub.isHorizontal ? 'H' : 'V', 'Posiciones:', sub.positions);
}


}
