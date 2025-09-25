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
import { sleep } from '../../../../utils/board-utils';

type ShotResult = {
  hit: boolean;
  miss: boolean;
  destroyed: boolean;
};

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

  lastShot: ShotResult = {
    hit: false,
    miss: false,
    destroyed: false,
  };
  turnBack: string = '';
  gameTurnBack = this.gameService.gameDTO()!;

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
      if (_msgSocket.lastShot) {
        this.lastShot = _msgSocket.lastShot;
        console.log('>> >> >> shotResult actualizado:', this.lastShot);
      }

      this.gameService.setGame(_msgSocket.game!); //Se Actualiza normal

      untracked(async () => {
        if (this.lastShot.hit) {
          this.audioService.play('hitSound', '/audio/hitSound.mp3');
          if (this.lastShot.destroyed) {
            this.audioService.play(
              'destroyedSound',
              '/audio/destroyedSound.mp3'
            );
          }
        }
        if (this.lastShot.miss) {
          this.audioService.play('missSound', '/audio/missSound.mp3');
          //Consigo el turno anterior para que la vista no cambie para que de tiempo a animaciones
          //COPIA PROFUNDA
          this.gameTurnBack = structuredClone(this.msgSocket().game!);
          this.turnBack =
            this.msgSocket().game!.turn! === 'player1' ? 'player2' : 'player1';

          this.gameTurnBack.turn = this.turnBack;
          this.gameService.setGame(this.gameTurnBack);
          await sleep(1800); // da tiempo a animacion
          this.gameService.setGame(_msgSocket.game!); //Se Actualiza para cambiar turno
        }
        await sleep(300); // da tiempo a animacion

        if (
          _msgSocket.game?.readyPlayer1 &&
          _msgSocket.game?.readyPlayer2 &&
          _msgSocket.phase === 'PLACEMENT'
        ) {
          _msgSocket.game.phase = 'BATTLE';
          await this.gameService.setGame(
            (
              await this.gameService.updateGame(_msgSocket.game)
            ).datos
          );
          this.page.set('BATTLE');
        }
        if (_msgSocket.game!.phase === 'END') {
          await sleep(1000); // da tiempo a ver el final

          const winner = _msgSocket.game!.winner;
          const me = this.gameService.me();
          const game = _msgSocket.game!;

          const iAmWinner = winner === me;
          const avatar =
            winner === 'player1' ? game.avatarPlayer1 : game.avatarPlayer2;

          const winnerNick = winner === 'player1' ? game.player1 : game.player2;

          const title = iAmWinner ? '¡VICTORIA!' : 'DERROTA';
          const coin = iAmWinner ? '150' : '10';

          const textColor = iAmWinner ? '#39ff14' : '#a91504';

          await Swal.fire({
            title,
            html: `
      <p class="text-lg font-bold" style="color:${textColor}">
        ${
          iAmWinner
            ? '¡Has ganado la partida!'
            : `Te ha vencido <span class="font-bold text-fluor">${winnerNick}</span>`
        }
      </p>
      <p class="text-yellow-400 font-bold mt-2">
        ${
          iAmWinner
            ? `Recibes por ganar <span class="text-xl">${coin} 🪙</span>`
            : `Recibes por participar <span class="text-xl">${coin} 🪙</span>`
        }
      </p>
    `,
            imageUrl: avatar,
            imageWidth: 140,
            imageHeight: 140,
            imageAlt: 'Avatar',
            customClass: {
              popup:
                'bg-principal text-fluor rounded-2xl shadow-black shadow-lg',
              image:
                'rounded-full shadow-black shadow-lg border-4 border-yellow-500',
              confirmButton:
                'bg-btn hover:bg-yellow-600 text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
              title: iAmWinner ? 'text-green-400' : 'text-red-500',
            },
            buttonsStyling: false,
            confirmButtonText: 'Aceptar',
          });

          this.pageChange.emit('MENU');
        }

        //Cambio el turno

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
      if (resp.lastShot?.miss) await sleep(1800); // da tiempo a animacion
      this.gameService.setGame(resp.game!); // actualizar
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
