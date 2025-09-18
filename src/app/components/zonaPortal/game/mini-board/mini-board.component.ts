import { Component, computed, inject } from '@angular/core';
import { GameService } from '../../../../services/game/game.service';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-mini-board',
  imports: [NgClass],
  templateUrl: './mini-board.component.html',
  styleUrl: './mini-board.component.css',
})
export class MiniBoardComponent {

  gameService = inject(GameService);
  storageService = inject(StorageService);
  game = computed(() => {
    return this.gameService.gameDTO();
  });

  me = computed(() => {
    return this.gameService.me();
  });

  


}