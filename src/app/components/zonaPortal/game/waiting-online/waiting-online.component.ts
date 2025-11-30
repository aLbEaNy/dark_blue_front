import { firstValueFrom } from 'rxjs';
import {
  Component,
  computed,
  effect,
  inject,
  output,
  resource,
  ResourceRef,
  signal,
  untracked,
} from '@angular/core';
import { GameService } from '../../../../services/game/game.service';
import { WebSocketService } from '../../../../services/webSocket/webSocket.service';
import IRestMessage from '../../../../models/IRestMessage';
import GameMessage from '../../../../models/GameMessage';
import { OnlineListenerComponent } from '../online-listener/online-listener.component';
import { AudioService } from '../../../../services/audio/audio.service';

@Component({
  selector: 'app-waiting-online',
  imports: [OnlineListenerComponent],
  templateUrl: './waiting-online.component.html',
  styleUrl: './waiting-online.component.css',
})
export class WaitingOnlineComponent {
  gameService = inject(GameService);
  webSocketService = inject(WebSocketService);
  audioService = inject(AudioService);
  perfil = this.gameService.storage.get<any>('perfil');
  private baseUrl = window.__env.backendUrl;
  nickname = this.perfil?.nickname;

  cancel = output<string>();
  pageOnline = output<string>();

  onlineResp = computed(() => {
    const _resp = this.createOnlineGameR.value();
    return _resp;
  });

  constructor() {
    effect(() => {
      const _resp = this.onlineResp();
      if (_resp?.codigo !== 0) return;
      console.log('game Effect del computed Resource ---> ', _resp.datos);
      console.log('gameId --->', _resp.datos.gameId);
    });
  }

  createOnlineGameR: ResourceRef<IRestMessage> = resource({
    loader: async () => {
      const response = await fetch(
        `${this.baseUrl}/game/new?nickname=${this.nickname}&online=true&gameId=''`
      );
      return response.json();
    },
  });

  async cancelar() {
    try {
      const resp = await this.gameService.cancelGame(
        this.onlineResp().datos.gameId
      );
      if (resp.codigo !== 0) {
        console.warn('No se pudo cancelar la partida:', resp.mensaje);
        return;
      }
    } catch (err) {
      console.error('Error al cancelar la partida', err);
    } finally {
      this.cancel.emit('MENU'); // notificar al padre para volver al menú
    }
  }
  async onGameMessage(msg: GameMessage) {
    console.log('#### -> Entra en onGameMessage waiting-Online-Component ', msg);
    if (msg.phase === 'JOINED') {
       
        this.audioService.play(
            'placement',
            `${this.baseUrl}/media/audio/placement.mp3?t=${Math.random()}`, //para evitar cache
            true,
            0.2
          );
      const _resp = await this.gameService.getGame(msg.game?.gameId!);
      _resp.datos.phase = 'PLACEMENT';
      const _resp2 = await this.gameService.updateGame(_resp.datos);
      this.gameService.setGame(_resp2.datos);
      this.pageOnline.emit('NEWGAME_ONLINE');
    }

    if (msg.phase === 'WAITING' && !this.onlineResp().datos.player2) {
      console.log('(onGameMessage)---> player1 buscando partida online...');
    }
    if (msg.phase === 'WAITING' && this.onlineResp().datos.player2) {
      console.log('(onGameMessage)---> player2 se une a la partida online...');
      const _resp = await this.gameService.getGame( await this.onlineResp().datos.gameId!);
      _resp.datos.phase = 'PLACEMENT';
      this.gameService.setGame(_resp.datos);
      this.pageOnline.emit('NEWGAME_ONLINE');     
      
    }
  }
}
