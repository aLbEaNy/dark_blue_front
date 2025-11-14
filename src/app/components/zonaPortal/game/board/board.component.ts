import { Component, inject, computed, effect, ViewChild, ElementRef } from '@angular/core';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { GameService } from '../../../../services/game/game.service';
import { formatPosition, parsePosition } from '../../../../utils/board-utils';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import Submarine from '../../../../models/Submarine';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-board',
  imports: [DragDropModule, NgStyle],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent {
  storageService = inject(StorageService);
  gameService = inject(GameService);

  //Referencia al tablero
  @ViewChild('boardRef') boardRef!: ElementRef<HTMLDivElement>;
  readonly BOARD_SIZE = 10;
  cellSize = 34;
  cells = Array.from({ length: 100 }, (_, i) => i);
  highlightError: { row: number; col: number }[] = [];

  // Computed board según si soy player1 o player2
  board = computed(() => {
    const dto = this.gameService.gameDTO();
    if (!dto) return null;
    return this.gameService.me() === 'player1' ? dto.boardPlayer1 : dto.boardPlayer2;
  });
  
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
  getCellStyle(index: number) {
    const row = Math.floor(index / this.BOARD_SIZE);
    const col = index % this.BOARD_SIZE;

    let borderColor = 'gray';
    if (this.highlightError.some((c) => c.row === row && c.col === col)) {
      borderColor = 'red';
    }

    return {
      border: `1px solid ${borderColor}`,
    };
  }
  parsePosition(pos: string) {
    return parsePosition(pos);
  }

  // Solo se hace snap al soltar, no mientras se arrastra
  async dropSubmarine(event: CdkDragEnd, sub: Submarine) {
    const boardEl = this.boardRef.nativeElement;
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
      if (col + sub.sizeSub > this.BOARD_SIZE)
        col = this.BOARD_SIZE - sub.sizeSub;
      if (row < 0) row = 0;
      if (row >= this.BOARD_SIZE) row = this.BOARD_SIZE - 1;
    } else {
      if (col < 0) col = 0;
      if (col >= this.BOARD_SIZE) col = this.BOARD_SIZE - 1;
      if (row < 0) row = 0;
      if (row + sub.sizeSub > this.BOARD_SIZE)
        row = this.BOARD_SIZE - sub.sizeSub;
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
    console.log(`Board me actualizado (${this.gameService.me()}): `, this.board());
    //Sincronizamos los cambios en la flota
    const _game= this.gameService.gameDTO()!;
    if(this.gameService.me() === 'player1'){
      _game.boardPlayer1 = this.board()!;
    }else {
      _game.boardPlayer2 = this.board()!;
    }
    const _resp = await this.gameService.updateGame(_game);
    this.gameService.setGame(_resp.datos);

    // Reset snap visual
    event.source.reset();
  }

  isPositionFree(sub: Submarine, row: number, col: number): boolean {
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
    sub.isHorizontal = !sub.isHorizontal; // intentamos rotar

    const firstPos = parsePosition(sub.positions[0]);
    let row = firstPos.row;
    let col = firstPos.col;

    // Limitar dentro del tablero
    if (sub.isHorizontal && col + sub.sizeSub > this.BOARD_SIZE) {
      col = this.BOARD_SIZE - sub.sizeSub;
    } else if (!sub.isHorizontal && row + sub.sizeSub > this.BOARD_SIZE) {
      row = this.BOARD_SIZE - sub.sizeSub;
    }

    // Si no cabe, mostrar highlightError temporal y revertir
    if (!this.isPositionFree(sub, row, col)) {
      this.highlightError = [];
      for (let i = 0; i < sub.sizeSub; i++) {
        if (sub.isHorizontal) this.highlightError.push({ row, col: col + i });
        else this.highlightError.push({ row: row + i, col });
      }
      sub.isHorizontal = oldOrientation;

      // Quitar el highlight rojo tras 1 segundo
      setTimeout(() => (this.highlightError = []), 1000);

      console.log('Rotación inválida, posiciones ocupadas.');
      return;
    }

    // Si la rotación es válida, actualizar posiciones normalmente
    const newPositions: string[] = [];
    for (let i = 0; i < sub.sizeSub; i++) {
      if (sub.isHorizontal) newPositions.push(formatPosition(row, col + i));
      else newPositions.push(formatPosition(row + i, col));
    }
    sub.positions = newPositions;
  }
}
