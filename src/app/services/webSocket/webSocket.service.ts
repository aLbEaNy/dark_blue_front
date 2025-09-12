import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private rxStomp: RxStomp;

  constructor() {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-game'),
      reconnectDelay: 5000,
    });
    this.rxStomp.activate();
  }

  subscribe(gameId: string) {
    return this.rxStomp.watch(`/topic/game/${gameId}`).pipe(
      map(message => JSON.parse(message.body))
    );
  }

  send(destination: string, body: any) {
    this.rxStomp.publish({ destination, body: JSON.stringify(body) });
  }
}
