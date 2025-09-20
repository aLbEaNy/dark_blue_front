import { firstValueFrom } from 'rxjs';
import {
  Component,
  computed,
  effect,
  inject,
  Injector,
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
import { OnlineListenerComponent } from "../online-listener/online-listener.component";

@Component({
  selector: 'app-waiting-online',
  imports: [OnlineListenerComponent],
  templateUrl: './waiting-online.component.html',
  styleUrl: './waiting-online.component.css',
})
export class WaitingOnlineComponent {
  gameService = inject(GameService);
  webSocketService = inject(WebSocketService);
  perfil = this.gameService.storage.get<any>('perfil');
  nickname = this.perfil?.nickname;

  cancel = output();
  pageOnline = output();


  onlineResp = computed(() => {
    const _resp = this.createOnlineGameR.value();
    return _resp;
  });
  
  
  constructor() {

    
    effect(() => {
      const _resp = this.onlineResp();
      if (_resp?.codigo !== 0) return;
      console.log('game ---> ', _resp.datos);
      console.log('gameId --->', _resp.datos.gameId);     
      if(_resp.datos.player2){
        this.onGameMessage({phase: 'JOINED'})
      }
    });
  }
  createOnlineGameR: ResourceRef<IRestMessage> = resource({
    loader: async () => {
      const response = await fetch(
        `http://localhost:8080/game/new?nickname=${this.nickname}&online=true&gameId=nothinghere`
      ); //No necesito gameId da igual
      return response.json();
    },
  });

  async cancelar() {
    try {
      this.webSocketService.disconnect(); // cerrar conexión WS

      const resp = await firstValueFrom(
        this.gameService.cancelGame(this.onlineResp().datos.gameId)
      );

      if (resp.codigo !== 0) {
        console.warn('No se pudo cancelar la partida:', resp.mensaje);
        return;
      }
    } catch (err) {
      console.error('Error al cancelar la partida', err);
    } finally {
      this.cancel.emit(); // notificar al padre para volver al menú
    }
  }
   onGameMessage(msg: GameMessage) {
    console.log('onGameMessage ---> ', msg);
    if(msg.phase === 'JOINED'){
      this.pageOnline.emit();
    }
   
  }
}
