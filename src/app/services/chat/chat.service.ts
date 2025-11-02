import { computed, inject, Injectable, signal } from '@angular/core';
import { GameService } from '../game/game.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  gameService = inject(GameService);

  toggleChatbox = signal(false);
  showChatbox = computed(() => {
    return this.toggleChatbox();
  });

  notification = signal(false);

}
