import { Injectable } from '@angular/core';
import Board from '../../models/Board';

@Injectable({ providedIn: 'root' })
export class AIService {
  private letters = 'ABCDEFGHIJ'.split('');
  
  // Estado interno
  private targetHits: string[] = [];
  private lastDirection: 'H' | 'V' | null = null;

  fire(board: Board): Board {
  if (board.submarines.every(sub => sub.isDestroyed)) return board;

  let pos: string;

  if (this.targetHits.length === 0) {
    pos = this.randomFreePosition(board);
  } else if (this.targetHits.length === 1) {
    const candidates = this.getAdjacent(this.targetHits[0], board);
    pos = this.pickRandom(candidates, board);
  } else {
    pos = this.fireAlongLine(board);
  }

  // Calcular resultado
  let result: 'HIT' | 'MISS' = 'MISS';
  const submarines = board.submarines.map(sub => {
    const index = sub.positions.indexOf(pos);
    if (index !== -1) {
      result = 'HIT';
      const isTouched = [...sub.isTouched];
      isTouched[index] = true;

      const isDestroyed = isTouched.every(t => t);

      if (isDestroyed) {
        this.targetHits = [];
        this.lastDirection = null;
      } else {
        this.targetHits = [...this.targetHits, pos];
        if (this.targetHits.length >= 2) {
          this.lastDirection = this.getDirection(this.targetHits);
        }
      }

      return { ...sub, isTouched, isDestroyed };
    }
    return sub;
  });

  return {
    ...board,
    submarines,
    shots: [...board.shots, { position: pos, result }]
  };
}


  /** Genera todas las posiciones del tablero */
  private allPositions(): string[] {
    const res: string[] = [];
    for (const r of this.letters) {
      for (let c = 1; c <= 10; c++) res.push(`${r}${c}`);
    }
    return res;
  }

  /** Disparo aleatorio entre posiciones libres */
  private randomFreePosition(board: Board): string {
    const used = board.shots.map(s => s.position);
    const candidates = this.allPositions().filter(p => !used.includes(p));
    return this.pickRandom(candidates, board);
  }

  /** Casillas vecinas libres de un HIT */
  private getAdjacent(pos: string, board: Board): string[] {
    const row = pos[0], col = parseInt(pos.slice(1), 10);
    const rowIdx = this.letters.indexOf(row);
    const candidates: string[] = [];
    if (rowIdx > 0) candidates.push(`${this.letters[rowIdx - 1]}${col}`);
    if (rowIdx < 9) candidates.push(`${this.letters[rowIdx + 1]}${col}`);
    if (col > 1) candidates.push(`${row}${col - 1}`);
    if (col < 10) candidates.push(`${row}${col + 1}`);
    const used = board.shots.map(s => s.position);
    return candidates.filter(c => !used.includes(c));
  }

  /** Disparo extendido a lo largo de la línea deducida */
  private fireAlongLine(board: Board): string {
    const rows = this.targetHits.map(h => h[0]);
    const cols = this.targetHits.map(h => parseInt(h.slice(1), 10));
    const used = board.shots.map(s => s.position);
    const candidates: string[] = [];

    if (this.lastDirection === 'H') {
      const row = rows[0];
      const min = Math.min(...cols), max = Math.max(...cols);
      if (min > 1) candidates.push(`${row}${min - 1}`);
      if (max < 10) candidates.push(`${row}${max + 1}`);
    } else if (this.lastDirection === 'V') {
      const col = cols[0];
      const rowIdxs = rows.map(r => this.letters.indexOf(r));
      const minIdx = Math.min(...rowIdxs), maxIdx = Math.max(...rowIdxs);
      if (minIdx > 0) candidates.push(`${this.letters[minIdx - 1]}${col}`);
      if (maxIdx < 9) candidates.push(`${this.letters[maxIdx + 1]}${col}`);
    }

    const free = candidates.filter(c => !used.includes(c));
    return free.length > 0 ? this.pickRandom(free, board) : this.randomFreePosition(board);
  }

  /** Deducción de orientación H o V */
  private getDirection(hits: string[]): 'H' | 'V' {
    const rows = hits.map(h => h[0]);
    return rows.every(r => r === rows[0]) ? 'H' : 'V';
  }

  /** Elegir al azar */
  private pickRandom(arr: string[], board: Board): string {
    if (!arr || arr.length === 0) return this.randomFreePosition(board);
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
