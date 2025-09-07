export default interface ICell {
coord: string;         // coordenada tipo "A1", "B5", etc.
  x: number;             // índice de columna (0-9)
  y: number;             // índice de fila (0-9)
  state: 'empty' | 'touched' | 'submarine' | 'water' | 'destroy'; // estado de la celda
}
