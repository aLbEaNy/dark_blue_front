import { Component, computed, inject, signal } from '@angular/core';
import { GameService } from '../../../../services/game/game.service';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { NgClass } from '@angular/common';
import { PerfilService } from '../../../../services/game/perfil.service';
import { ChatComponent } from "../chat/chat.component";
import { ChatBoxComponent } from "../chat-box/chat-box.component";
import { ChatService } from '../../../../services/chat/chat.service';

@Component({
  selector: 'app-mini-board',
  imports: [NgClass, ChatComponent, ChatBoxComponent],
  templateUrl: './mini-board.component.html',
  styleUrl: './mini-board.component.css',
})
export class MiniBoardComponent {

  gameService = inject(GameService);
  storageService = inject(StorageService);
  chatService = inject(ChatService);
  perfilService = inject(PerfilService);

  perfil = this.perfilService.perfil();
  showChatbox = this.chatService.showChatbox;

  avatarRival = computed(() => {
    return this.perfil.nickname === this.game()?.player1 ? this.game()?.avatarPlayer2 : this.game()?.avatarPlayer1;
  });



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