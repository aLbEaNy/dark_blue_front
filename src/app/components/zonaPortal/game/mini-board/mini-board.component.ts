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

  perfil = this.storageService.get<any>('perfil');


  game = computed(() => {
    return this.gameService.gameDTO();
  });

  meBoard = computed(() => {
    const board = this.perfil.nickname === this.game()?.player1 ? this.game()?.boardPlayer1 : this.game()?.boardPlayer2;
    return board;
  });
  boardRival = computed(() => {
    const board = this.perfil.nickname === this.game()?.player1 ? this.game()?.boardPlayer2 : this.game()?.boardPlayer1;
    return board;
  });

  me = computed(() => {
    return this.gameService.me();
  });

  


}