import { GameService } from './../../../../services/game/game.service';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { Component, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-mini-display-user',
  imports: [NgClass],
  templateUrl: './mini-display-user.component.html',
  styleUrl: './mini-display-user.component.css',
})
export class MiniDisplayUserComponent {
  gameService = inject(GameService);
  storageService = inject(StorageService);
  nicknameDisplay = computed(() => {
    const dto = this.gameService.gameDTO();
    if (!dto) return ''; // <-- prevenir null
    console.log('En computed nicknameDisplay según fase ', dto.phase);
    if (dto.phase === 'BATTLE' && this.gameService.me() === 'player1') {
      return this.gameService.isMyTurn() ? dto.player1 : dto.player2;
    } else if (dto.phase === 'BATTLE' && this.gameService.me() === 'player2') {
      return this.gameService.isMyTurn() ? dto.player2 : dto.player1;
    } else {
      return this.gameService.me() === 'player1' ? dto.player1 : dto.player2;
    }
  });
  avatarDisplay = computed(() => {
    const dto = this.gameService.gameDTO();
    if (!dto) return ''; // <-- prevenir null
    if (dto.phase === 'BATTLE' && this.gameService.me() === 'player1') {
      return this.gameService.isMyTurn() ? dto.avatarPlayer1 : dto.avatarPlayer2;
    }else if(dto.phase === 'BATTLE' && this.gameService.me() === 'player2')
      return this.gameService.isMyTurn() ? dto.avatarPlayer2 : dto.avatarPlayer1;
    
    else {
      return this.gameService.me() === 'player1'
        ? dto.avatarPlayer1
        : dto.avatarPlayer2;
    }
  });
}
