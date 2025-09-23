import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import { Subscription } from 'rxjs';
import GameMessage from '../../../../models/GameMessage';
import { AudioService } from '../../../../services/audio/audio.service';
import { GameService } from '../../../../services/game/game.service';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { WebSocketService } from '../../../../services/webSocket/webSocket.service';
import { MiniDisplayUserComponent } from '../mini-display-user/mini-display-user.component';
import { BoardComponent } from '../board/board.component';
import { MiniPlacementComponent } from '../mini-placement/mini-placement.component';
import { BoardAtackComponent } from '../board-atack/board-atack.component';
import { MiniBoardComponent } from '../mini-board/mini-board.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-online-game',
  imports: [
    MiniDisplayUserComponent,
    BoardComponent,
    MiniPlacementComponent,
    BoardAtackComponent,
    MiniBoardComponent,
  ],
  templateUrl: './online-game.component.html',
  styleUrl: './online-game.component.css',
})
export class OnlineGameComponent implements OnInit, OnDestroy {
  audioService = inject(AudioService);
  storage = inject(StorageService);
  gameService = inject(GameService);
  webSocketService = inject(WebSocketService);
  private sub?: Subscription;
  msgSocket = signal<GameMessage>({ phase: 'PLACEMENT' });
  perfil = signal(this.storage.get<any>('perfil'));
  pageChange = output<string>(); // hacia main
  page = signal('PLACEMENT'); // Para las que cuelgan

  ngOnInit() {
    this.conectSocket();
  }

  async conectSocket() {
    // Subcripción al socket para online

    this.sub = this.webSocketService
      .watchGameMessage(this.gameService.gameDTO()!.gameId)
      .subscribe((msg) => {
        if (!msg) return;
        console.log(
          `>>>----> Mensaje del topic: con gameId ${
            this.gameService.gameDTO()!.gameId
          }`,
          msg
        );
        this.msgSocket.set(msg);
      });
  }

  constructor() {
    effect(() => {
      //ONLINE webSocket
      const _msgSocket = this.msgSocket();
      if (!_msgSocket || !_msgSocket.game) return;
      console.log('msgSocket vale: ', _msgSocket);

      untracked(async () => {
        this.gameService.setGame(_msgSocket.game!);//Se Actualiza 

        if (_msgSocket.game?.readyPlayer1 && _msgSocket.game?.readyPlayer2 && _msgSocket.phase === 'PLACEMENT') {
          _msgSocket.game.phase = 'BATTLE';
          await this.gameService.setGame((await this.gameService.updateGame(_msgSocket.game)).datos);
          this.page.set('BATTLE');
        }
        if (_msgSocket.game!.phase === 'END') {
          const winner = _msgSocket.game!.winner;
          Swal.fire(`Partida finalizada`, `${winner} ha ganado`, 'success');
          this.page.set('PLACEMENT'); // O nueva partida
        }
        // marcar si es tu turno
        const me = this.gameService.me();
        this.gameService.isMyTurn.set(_msgSocket.game!.turn === me);
      });
    });
  }

  async playerFire(pos: string) {
    const me = this.gameService.me();
    const gameId = this.gameService.gameDTO()!.gameId;

    // Solo disparo si es mi turno
    if (this.gameService.gameDTO()?.turn !== me) {
      console.log('No es tu turno, espera...');
      return;
    }

    console.log(`[ONLINE] ${me} dispara en ${pos}`);

    try {
      const resp = await this.gameService.shoot(gameId, me!, pos);
      this.gameService.setGame(resp.game!); // opcional, socket debería actualizar
    } catch (err) {
      console.error('Error al enviar disparo:', err);
    }
  }

  async cancelar() {
    try {
      this.webSocketService.disconnect(); // cerrar conexión WS

      const resp = await this.gameService.cancelGame(
        this.gameService.gameDTO()!.gameId
      );

      if (resp.codigo !== 0) {
        console.warn('No se pudo cancelar la partida:', resp.mensaje);
        return;
      }
    } catch (err) {
      console.error('Error al cancelar la partida', err);
    } finally {
      this.pageChange.emit('MENU');
    }
  }

  ngOnDestroy() {
    this.webSocketService.disconnect(); // cerrar conexión WS
    this.sub?.unsubscribe();
  }
}
