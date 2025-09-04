import { Component, signal } from '@angular/core';
import ICell from '../../../../models/ICell';
import { generateBoard } from '../../../../utils/board-utils';

@Component({
  selector: 'app-board',
  imports: [],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {
 board = signal<ICell[][]>(generateBoard());

  onCellClick(cell: ICell) {
    console.log("Click en:", cell.coord);
  }

  onDragStart(event: DragEvent, cell: ICell) {
    event.dataTransfer?.setData("text/plain", cell.coord);
    console.log("Drag start:", cell.coord);
  }

  onDrop(event: DragEvent, cell: ICell) {
    const fromCoord = event.dataTransfer?.getData("text/plain");
    console.log(`Drop: ${fromCoord} → ${cell.coord}`);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // necesario para permitir el drop
  }
}

