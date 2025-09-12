import { GameService } from './../../../../services/game/game.service';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { Component, computed, inject, signal, untracked } from '@angular/core';

@Component({
  selector: 'app-mini-display-user',
  imports: [],
  templateUrl: './mini-display-user.component.html',
  styleUrl: './mini-display-user.component.css'
})
export class MiniDisplayUserComponent {
  
  gameService =inject(GameService);
  storageService = inject(StorageService);
  nicknameDisplay = computed(() => {
    const dto = this.gameService.gameDTO();
    if (!dto) return ''; // <-- prevenir null
    console.log('FASE.......... ', dto.phase)
    if (dto.phase === 'BATTLE'){
      return this.gameService.me() === 'player1' && this.gameService.isMyTurn() ? dto.player1 : dto.player2;
    } else {
      return this.gameService.me() === 'player1' ? dto.player1 : dto.player2;
    }
  });
  avatarDisplay = computed(() => {
    const dto = this.gameService.gameDTO();
    if (!dto) return ''; // <-- prevenir null
     if (dto.phase === 'BATTLE'){
      return this.gameService.me() === 'player1' && this.gameService.isMyTurn() ? dto.avatarPlayer1 : dto.avatarPlayer2;
    } else {
      return this.gameService.me() === 'player1' ? dto.avatarPlayer1 : dto.avatarPlayer2;
    }
  });

}
