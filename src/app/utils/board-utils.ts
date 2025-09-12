export function parsePosition(pos: string): { row: number; col: number } {
  const row = pos.charCodeAt(0) - 65; // 'A' → 0, 'B' → 1, etc.
  const col = parseInt(pos.slice(1), 10) - 1; // '1' → 0, '10' → 9
  return { row, col };
}
export function formatPosition(row: number, col: number): string {
  const letter = String.fromCharCode(65 + row); // 0 -> 'A', 1 -> 'B', etc.
  const number = col + 1; // 0 -> 1, 9 -> 10
  return `${letter}${number}`;
}

export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

// nextFrame() es útil para ceder al browser y que pinte antes del siguiente disparo.
export const nextFrame = () => new Promise<void>(res => requestAnimationFrame(() => res()));