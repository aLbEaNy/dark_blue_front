export type CellState = 'empty' | 'touched' | 'submarine' | 'water' | 'destroy';
export default interface ICell {

   coord: string;     // "A1", "B7", etc.
   state: CellState;  // estado actual
}