import { Injectable } from '@angular/core';
import Board from '../../models/Board';

@Injectable({ providedIn: 'root' })
export class AIService {
  private letters = 'ABCDEFGHIJ'.split('');

  //targetHits representa los HIT que la IA está persiguiendo pendientes de hundir
  private targetHits: string[] = [];
  private lastDirection: 'H' | 'V' | null = null;

  fire(board: Board, laserPos: string = ''): Board {
    if (board.submarines.every((sub) => sub.isDestroyed)) return board;

    // 1) Decidir posición a disparar según estado actual
    let pos: string;
    if (this.targetHits.length === 0) {
      pos = this.smartRandomPosition(board);
    } else if (this.targetHits.length === 1) {
      const candidates = this.getAdjacent(this.targetHits[0], board);
      pos = this.pickRandom(candidates, board);
    } else {
      pos = this.fireAlongLine(board);
    }
    if (laserPos !== '') {
      pos = laserPos;
    }

    // 2) Aplicar el resultado sobre una copia de los submarinos
    const updatedSubmarines = board.submarines.map((sub) => {
      const index = sub.positions.indexOf(pos);
      if (index !== -1) {
        const isTouched = [...sub.isTouched];
        isTouched[index] = true;
        const isDestroyed = isTouched.every((t) => t);
        return { ...sub, isTouched, isDestroyed };
      }
      return sub;
    });

    // Determinar si fue HIT y cuál submarino fue afectado
    const hitIndex = updatedSubmarines.findIndex((s) =>
      s.positions.includes(pos)
    );
    const wasHit = hitIndex !== -1;
    const hitSub = wasHit ? updatedSubmarines[hitIndex] : null;
    const result: 'HIT' | 'MISS' = wasHit ? 'HIT' : 'MISS';

    // 3) Gestión del comportamiento tras el resultado
    if (wasHit && hitSub) {
      if (hitSub.isDestroyed) {
        // Hundido: limpiar el frente actual y buscar hits activos en subs no hundidos
        this.targetHits = [];
        this.lastDirection = null;

        const allShots = [...board.shots, { position: pos, result }];
        let resumed = false;
        for (let i = allShots.length - 1; i >= 0 && !resumed; i--) {
          const shotPos = allShots[i].position;
          for (const s of updatedSubmarines) {
            if (!s.isDestroyed) {
              const idx = s.positions.indexOf(shotPos);
              if (idx !== -1 && s.isTouched[idx]) {
                const activeHits: string[] = [];
                s.positions.forEach((p, j) => {
                  if (s.isTouched[j]) activeHits.push(p);
                });
                if (activeHits.length > 0) {
                  this.targetHits = activeHits;
                  this.lastDirection =
                    this.targetHits.length >= 2
                      ? this.getDirection(this.targetHits)
                      : null;
                  resumed = true;
                  break;
                }
              }
            }
          }
        }
      } else {
        // Fue HIT pero no hundió: añadir a seguimiento actual
        if (!this.targetHits.includes(pos)) {
          this.targetHits = [...this.targetHits, pos];
        }
        if (this.targetHits.length >= 2) {
          this.lastDirection = this.getDirection(this.targetHits);
        }
      }
    }

    // 4) Devolver nuevo board
    return {
      ...board,
      submarines: updatedSubmarines,
      shots: [...board.shots, { position: pos, result }],
    };
  }

  // -------------------------------------------------------
  // UTILIDADES
  // -------------------------------------------------------

  private allPositions(): string[] {
    const res: string[] = [];
    for (const r of this.letters) {
      for (let c = 1; c <= 10; c++) res.push(`${r}${c}`);
    }
    return res;
  }

  /** Tiro aleatorio inteligente: prioriza posiciones con más casillas libres alrededor */
  private smartRandomPosition(board: Board): string {
    const used = board.shots.map((s) => s.position);
    const free = this.allPositions().filter((p) => !used.includes(p));

    const freeWithSpace = free.map((pos) => ({
      pos,
      space: this.getMaxFreeLine(pos, used),
    }));

    freeWithSpace.sort((a, b) => b.space - a.space); // Prioridad a zonas más abiertas

    const topN = freeWithSpace.filter(
      (c) => c.space === freeWithSpace[0].space
    );
    return topN[Math.floor(Math.random() * topN.length)].pos;
  }

  private getMaxFreeLine(pos: string, used: string[]): number {
    const row = pos[0];
    const col = parseInt(pos.slice(1), 10);
    const horizontal = this.countFreeLine(row, col, used, 'H');
    const vertical = this.countFreeLine(row, col, used, 'V');
    return Math.max(horizontal, vertical);
  }

  private countFreeLine(
    row: string,
    col: number,
    used: string[],
    dir: 'H' | 'V'
  ): number {
    const rowIdx = this.letters.indexOf(row);
    let count = 1;

    for (let offset = 1; offset < 10; offset++) {
      const r = dir === 'H' ? row : this.letters[rowIdx - offset];
      const c = dir === 'H' ? col - offset : col;
      if (!r || c < 1 || used.includes(`${r}${c}`)) break;
      count++;
    }
    for (let offset = 1; offset < 10; offset++) {
      const r = dir === 'H' ? row : this.letters[rowIdx + offset];
      const c = dir === 'H' ? col + offset : col;
      if (!r || c > 10 || used.includes(`${r}${c}`)) break;
      count++;
    }
    return count;
  }

  private getAdjacent(pos: string, board: Board): string[] {
    const row = pos[0];
    const col = parseInt(pos.slice(1), 10);
    const idx = this.letters.indexOf(row);
    const candidates: string[] = [];
    if (idx > 0) candidates.push(`${this.letters[idx - 1]}${col}`);
    if (idx < 9) candidates.push(`${this.letters[idx + 1]}${col}`);
    if (col > 1) candidates.push(`${row}${col - 1}`);
    if (col < 10) candidates.push(`${row}${col + 1}`);
    const used = board.shots.map((s) => s.position);
    return candidates.filter((c) => !used.includes(c));
  }

  private fireAlongLine(board: Board): string {
    const rows = this.targetHits.map((h) => h[0]);
    const cols = this.targetHits.map((h) => parseInt(h.slice(1), 10));
    const used = board.shots.map((s) => s.position);
    let cands: string[] = [];

    if (this.lastDirection === 'H') {
      const row = rows[0];
      const min = Math.min(...cols),
        max = Math.max(...cols);
      if (min > 1) cands.push(`${row}${min - 1}`);
      if (max < 10) cands.push(`${row}${max + 1}`);
    } else if (this.lastDirection === 'V') {
      const col = cols[0];
      const idxs = rows.map((r) => this.letters.indexOf(r));
      const minIdx = Math.min(...idxs),
        maxIdx = Math.max(...idxs);
      if (minIdx > 0) cands.push(`${this.letters[minIdx - 1]}${col}`);
      if (maxIdx < 9) cands.push(`${this.letters[maxIdx + 1]}${col}`);
    }

    let free = cands.filter((c) => !used.includes(c));

    // ⚡ Probar la dirección perpendicular si no hay libres
    if (free.length === 0) {
      const altCands: string[] = [];
      if (this.lastDirection === 'H') {
        for (const h of this.targetHits) {
          const rowIdx = this.letters.indexOf(h[0]);
          const col = parseInt(h.slice(1), 10);
          if (rowIdx > 0) altCands.push(`${this.letters[rowIdx - 1]}${col}`);
          if (rowIdx < 9) altCands.push(`${this.letters[rowIdx + 1]}${col}`);
        }
      } else if (this.lastDirection === 'V') {
        for (const h of this.targetHits) {
          const row = h[0];
          const col = parseInt(h.slice(1), 10);
          if (col > 1) altCands.push(`${row}${col - 1}`);
          if (col < 10) altCands.push(`${row}${col + 1}`);
        }
      }
      free = altCands.filter((c) => !used.includes(c));
    }

    if (free.length === 0) return this.smartRandomPosition(board);
    return this.pickRandom(free, board);
  }

  private getDirection(hits: string[]): 'H' | 'V' {
    const rows = hits.map((h) => h[0]);
    return rows.every((r) => r === rows[0]) ? 'H' : 'V';
  }

  private pickRandom(arr: string[], board: Board): string {
    if (!arr || arr.length === 0) return this.smartRandomPosition(board);
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getLaserPositions(board: Board): string[] {
    const used = board.shots.map((s) => s.position);
    let positions: string[] = [];
    while (true) {
      const laser_H_V = Math.random() < 0.5 ? 'H' : 'V';
      let letter;
      let number;
      if (laser_H_V === 'H') {
        letter = this.letters[Math.floor(Math.random() * this.letters.length)];
      }
      if (laser_H_V === 'V') {
        number = Math.floor(Math.random() * 10) + 1;
      }
      if (laser_H_V === 'H') {
        // Fila completa
        for (let i = 0; i < 10; i++) {
          positions.push(`${letter}${i + 1}`);
        }
      } else {
        // Columna completa
        for (let i = 0; i < 10; i++) {
          positions.push(`${this.letters[i]}${number}`);
        }
      }
     positions = positions.filter((p) => !used.includes(p));
      if (positions.length > 0) break;
      positions = [];

    }

    return positions;
  }
}
