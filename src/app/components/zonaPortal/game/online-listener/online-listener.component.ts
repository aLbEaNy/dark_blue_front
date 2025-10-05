import { GameService } from './../../../../services/game/game.service';
import { WebSocketService } from './../../../../services/webSocket/webSocket.service';
import {
  Component,
  inject,
  input,
  output,
  OnInit,
  OnDestroy,
  effect,
  signal,
  untracked,
} from '@angular/core';
import { Subscription } from 'rxjs';
import GameMessage from '../../../../models/GameMessage';

@Component({
  selector: 'app-online-listener',
  templateUrl: './online-listener.component.html',
  styleUrls: ['./online-listener.component.css'],
})
export class OnlineListenerComponent implements OnInit, OnDestroy {
  webSocketService = inject(WebSocketService);
  gameService = inject(GameService);

  gameId = input<string>();
  gameMessageOutput = output<GameMessage>();
  msgSocket = signal<GameMessage | null>(null);

  private sub?: Subscription;

  async ngOnInit() {
    console.log('     onInit el gameId es: ', this.gameId());
    this.conectSocket();
  }
  constructor() {
    effect(() => {
      const _msgSocket = this.msgSocket();
      if (!_msgSocket) return;
      untracked(() => {
        this.gameMessageOutput.emit(_msgSocket);
      });
    });
  }


  async conectSocket() {
    // Subcripción al socket para online
    this.sub = this.webSocketService
      .watchGameMessage(this.gameId()!)
      .subscribe((msg) => {
        if (!msg) return;
        this.msgSocket.set(msg);
      });
  }

  ngOnDestroy() {
    console.log('Se destruye el componente online-listener para ', this.gameId());
    this.sub?.unsubscribe();
    this.msgSocket.set(null);
  }
}
