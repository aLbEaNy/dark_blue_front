import { WebSocketService } from './../../../../services/webSocket/webSocket.service';
import { Component, inject, input, output, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import GameMessage from '../../../../models/GameMessage';

@Component({
  selector: 'app-online-listener',
  templateUrl: './online-listener.component.html',
  styleUrls: ['./online-listener.component.css']
})
export class OnlineListenerComponent implements OnInit {
  webSocketService = inject(WebSocketService);

  gameId = input<string>()
  gameMessageOutput = output<GameMessage>();

  private sub?: Subscription;

  ngOnInit() {
    // Solo suscribirse cuando tenemos gameId
    if (!this.gameId) return;

    this.sub = this.webSocketService.watchGameMessage(this.gameId()!).subscribe(msg => {
      if (!msg) return;
      console.log('Mensaje recibido del topic:', msg);
      this.gameMessageOutput.emit(msg);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
