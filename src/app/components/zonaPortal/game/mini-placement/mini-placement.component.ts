import { Component, output } from '@angular/core';

@Component({
  selector: 'app-mini-placement',
  imports: [],
  templateUrl: './mini-placement.component.html',
  styleUrl: './mini-placement.component.css'
})
export class MiniPlacementComponent {
  pageChange = output<string>();

  startBattle(event: MouseEvent, page: string) {
    this.pageChange.emit(page);
  }


}
