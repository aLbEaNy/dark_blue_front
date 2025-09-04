import ICell from "../models/ICell";


export function generateBoard(): ICell[][] {
  const rows = ["A","B","C","D","E","F","G","H","I","J"];
  const cols = ["1","2","3","4","5","6","7","8","9","10"];

  const matrix: ICell[][] = [];

  for (const row of rows) {
    const rowCells: ICell[] = [];
    for (const col of cols) {
      rowCells.push({ coord: row + col, state: 'empty' });
    }
    matrix.push(rowCells);
  }

  return matrix;
}
