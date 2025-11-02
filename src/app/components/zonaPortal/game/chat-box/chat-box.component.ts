import {
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ChatService } from '../../../../services/chat/chat.service';
import GameMessage from '../../../../models/GameMessage';
import { GameService } from '../../../../services/game/game.service';
import { WebSocketService } from '../../../../services/webSocket/webSocket.service';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { PerfilService } from '../../../../services/game/perfil.service';

@Component({
  selector: 'app-chat-box',
  imports: [NgClass],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.css',
})
export class ChatBoxComponent {
  chatService = inject(ChatService);
  showChatbox = this.chatService.showChatbox();
  toggleChatbox = this.chatService.toggleChatbox;
  toggleChatboxMax = signal(false);
  gameService = inject(GameService);
  gameId = this.gameService.gameDTO()!.gameId;
  me = this.gameService.me();
  perfil = inject(PerfilService).perfil();

  messages = signal<GameMessage[]>([]);
  newMessage = signal('');
  private sub?: Subscription; 
  msgBox = viewChild<ElementRef>('msgBox');

  constructor(private ws: WebSocketService) {
    //Este effect detecta cambios en los mensajes y hace scroll al final
    effect(() => {
      const msgs = this.messages();
      if (msgs.length === 0) return;
      queueMicrotask(() => this.scrollToBottom());
      untracked(() =>{
        if(!this.chatService.showChatbox()) this.chatService.notification.set(true);
        else this.chatService.notification.set(false);
      });

    });
    
  }

  ngOnInit() {
    // Suscribirse al mismo topic de la partida
    this.sub = this.ws.watchGameMessage(this.gameId).subscribe((msg) => {
      if (msg?.type === 'CHAT') {
        this.messages.update((msgs) => [...msgs, msg]);
      }
    });
  }

  scrollToBottom(): void {
    const el = this.msgBox()?.nativeElement;
    if (!el) return;

    // usar queueMicrotask asegura que el DOM ya está actualizado
    queueMicrotask(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    });
  }

  sendMessage() {
    const trimmed = this.newMessage()!.trim();
    if (!trimmed) return;

    const msg: GameMessage = {
      type: 'CHAT',
      sender: this.me,
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    this.ws.sendChat(this.gameId, msg);
    this.newMessage.set('');
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
