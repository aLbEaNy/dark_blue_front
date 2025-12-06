import { WebSocketService } from './../../../../services/webSocket/webSocket.service';
import { GameService } from './../../../../services/game/game.service';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { Component, computed, inject, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { AudioService } from '../../../../services/audio/audio.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { sleep } from '../../../../utils/board-utils';
@Component({
  selector: 'app-mini-display-user',
  imports: [NgClass],
  templateUrl: './mini-display-user.component.html',
  styleUrl: './mini-display-user.component.css',
})
export class MiniDisplayUserComponent {
  gameService = inject(GameService);
  storageService = inject(StorageService);
  audioService = inject(AudioService);
  router = inject(Router);
  exitGame = output<boolean>();

  private baseUrl = window.__env.backendUrl;
  pageChange = output<string>();
  nicknameDisplay = computed(() => {
    const dto = this.gameService.gameDTO();
    if (!dto) return ''; // <-- prevenir null
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
      return this.gameService.isMyTurn()
        ? dto.avatarPlayer1
        : dto.avatarPlayer2;
    } else if (dto.phase === 'BATTLE' && this.gameService.me() === 'player2')
      return this.gameService.isMyTurn()
        ? dto.avatarPlayer2
        : dto.avatarPlayer1;
    else {
      return this.gameService.me() === 'player1'
        ? dto.avatarPlayer1
        : dto.avatarPlayer2;
    }
  });

  async exit() {
    const result = await Swal.fire({
      title: 'Abandonar el juego',
      html: `
    <p class="text-xl font-semibold text-orange-400">
      ¿Estás seguro que quieres salir?
    </p>
    <p class="text-yellow-300 font-medium mt-2">
      No recibirás ninguna recompensa...
    </p>
  `,
      customClass: {
        popup: `
      bg-principal 
      rounded-2xl 
      shadow-2xl 
      shadow-black/70 
      border 
      border-white/10
      p-6
    `,
        confirmButton: `
      bg-green-600 
      text-white 
      font-bold 
      px-6 py-2 
      rounded-xl 
      shadow-md 
      hover:bg-green-700
      hover:shadow-lg 
      transition-all 
      duration-200
      cursor-pointer
      mr-2
    `,
        cancelButton: `
      bg-red-500 
      text-white 
      font-bold 
      px-6 py-2 
      rounded-xl 
      shadow-md 
      hover:bg-red-600
      hover:shadow-lg 
      transition-all 
      duration-200
      cursor-pointer
      ml-2
    `,
      },
      buttonsStyling: false,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
    if (result.isDismissed) {
      return;
    } 
    if (!this.gameService.gameDTO()?.online) {
      this.pageChange.emit('MENU');
    } else {
      this.exitGame.emit(true);
      const _resp = await this.gameService.exitGame(this.gameService.gameDTO()?.gameId!);
      if(_resp)
        console.log('Se envió señal al socket de EXIT')
      }
    this.audioService.stopAll();
    this.audioService.play(
      'menu2',
      `${this.baseUrl}/media/audio/menu2.mp3`,
      true,
      0.2
    );
    const _game = this.gameService.gameDTO()
    _game?.gameId===null;
    this.gameService.setGame(_game!)
  }
}
