export const LETTERS = "ABCDEFGHIJ".split("");

// Convierte "D5" → {row:3, col:4}
export function parsePosition(pos: string): { row: number; col: number } {
  const letter = pos[0];
  const col = parseInt(pos.slice(1), 10) - 1;
  const row = LETTERS.indexOf(letter);
  return { row, col };
}

// // Genera tablero ["A1","A2",...,"J10"]
export function generateBoard(): string[][] {
  return LETTERS.map(letter =>
    Array.from({ length: 10 }, (_, i) => `${letter}${i + 1}`)
  );
}


// Convierte {row:3, col:4} → "D5"
export function stringifyPosition(row: number, col: number): string {
  return `${LETTERS[row]}${col + 1}`;
}
