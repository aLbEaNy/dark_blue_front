import { Injectable, inject } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { map, startWith } from 'rxjs/operators';
import GameMessage from '../../models/GameMessage';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private rxStomp: RxStomp;
  private socketUrl = window.__env.socketUrl;

  constructor() {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      brokerURL: `${this.socketUrl}`,
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
    });
    this.rxStomp.activate();
  }

  
  watchGameMessage(gameId: string): Observable<GameMessage | undefined> {
    const gameMessage$ = this.rxStomp.watch(`/topic/game/${gameId}`).pipe(
      map(message => JSON.parse(message.body) as GameMessage),
      startWith({ phase: 'WAITING' } as GameMessage) // valor inicial game opcional en interface
    );
    return gameMessage$;
}

  sendChat(gameId: string, msg: GameMessage) {
    this.rxStomp.publish({ destination: `/app/chat/${gameId}`, body: JSON.stringify(msg) });
  }
  sendGameMessage(gameId: string, msg: GameMessage) {
    this.rxStomp.publish({ destination: `/app/game/${gameId}`, body: JSON.stringify(msg) });
  }

  async firePosition(pos: string) {
    this.rxStomp.publish({ destination: '/app/fire', body: pos });
  }
  
  async sendMultishot() {
    this.rxStomp.publish({ destination: '/app/multishot', body: '' });
  }

  disconnect() {
    this.rxStomp.deactivate();
  }
}
