import { Injectable, inject } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import GameMessage from '../../models/GameMessage';
import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private rxStomp: RxStomp;

  constructor() {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      brokerURL: 'ws://localhost:8080/ws-game',
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

  send(destination: string, body: any) {
    this.rxStomp.publish({ destination, body: JSON.stringify(body) });
  }

  disconnect() {
    this.rxStomp.deactivate();
  }
}
