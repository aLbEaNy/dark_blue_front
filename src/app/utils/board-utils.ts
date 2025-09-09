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
// 


// <!-- board.component.html -->
// <div id="board" class="relative w-[340px] h-[340px] border border-gray-600 mt-3 shadow-2xl shadow-black justify-self-center">
//   <!-- Grid 10x10 -->
//   <div class="grid w-full h-full bg-blue-900"
//        [style.gridTemplateColumns]="'repeat(10, ' + cellSize + 'px)'"
//        [style.gridTemplateRows]="'repeat(10, ' + cellSize + 'px)'">
//     @for (i of cells; track i) {
//       <div class="border border-gray-500"></div>
//     }
//   </div>

//   <!-- Submarinos con CDK Drag -->
//   @for (sub of board()?.submarines; track sub.id) {
//     <img [src]="sub.isHorizontal ? 'images/submarine-H.png' : 'images/submarine-V.png'"
//          class="absolute"
//          [style.left.px]="parsePosition(sub.positions[0]).col * cellSize"
//          [style.top.px]="parsePosition(sub.positions[0]).row * cellSize"
//          [style.width.px]="sub.isHorizontal ? sub.sizeSub * cellSize : cellSize"
//          [style.height.px]="sub.isHorizontal ? cellSize : sub.sizeSub * cellSize"
//          alt="submarino"
//          cdkDrag
//          [cdkDragBoundary]="'#board'"
//          (cdkDragEnded)="dropSubmarine($event, sub)">
//   }
// </div>
