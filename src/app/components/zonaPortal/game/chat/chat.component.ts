import {
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  output,
  signal,
  untracked,
} from '@angular/core';
import { ChatService } from '../../../../services/chat/chat.service';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-chat',
  imports: [NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  chatService = inject(ChatService);
  showChatbox = this.chatService.showChatbox;
  toggleChatbox = this.chatService.toggleChatbox;
  notification = this.chatService.notification;
  notify = linkedSignal(() => this.notification());
 
  constructor() {
    effect(() => {
      const _notification = this.notification();
      if (!_notification) return;
      untracked(() => {
        if (this.showChatbox()) {
          this.notification.set(false);
        } 
      });
    });
    effect(() => {
      const _showChatbox = this.toggleChatbox();
      if (_showChatbox) return;
      this.notify.set(false);
  });
  }


}
