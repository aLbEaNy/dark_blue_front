import { PerfilService } from './../../../../services/game/perfil.service';
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
import { AIService } from '../../../../services/game/ai.service';
import { SpecialService } from '../../../../services/game/special.service';
import { OnlineBoardAtackComponent } from '../online-board-atack/online-board-atack.component';
import Game from '../../../../models/Game';

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
    MiniBoardComponent,
    OnlineBoardAtackComponent,
  ],
  templateUrl: './online-game.component.html',
  styleUrl: './online-game.component.css',
})
export class OnlineGameComponent implements OnInit, OnDestroy {
  audioService = inject(AudioService);
  storage = inject(StorageService);
  gameService = inject(GameService);
  aIService = inject(AIService);
  specialService = inject(SpecialService);
  webSocketService = inject(WebSocketService);
  private sub?: Subscription;
  private baseUrl = window.__env.backendUrl;
  msgSocket = signal<GameMessage>({ phase: 'PLACEMENT' });
  perfilService = inject(PerfilService);
  perfil = this.perfilService.perfil;
  pageChange = output<string>(); // hacia main
  page = signal('PLACEMENT'); // Para los hijos
  chatMessages = signal<GameMessage[]>([]);
  exitGame = signal(false);
  alonePlayer = false;
  updateBoard = signal(false);

  lastShot: ShotResult = {
    hit: false,
    miss: false,
    destroyed: false,
  };

  turnBack: string = '';
  gameTurnBack = this.gameService.gameDTO()!;
  disableFire = signal(false);
  slot1Player1Ready = this.specialService.readyPlayerSpecial1;
  slot2Player1Ready = this.specialService.readyPlayerSpecial2;
  slot1Player2Ready = this.specialService.readyPlayerRivalSpecial1;
  slot2Player2Ready = this.specialService.readyPlayerRivalSpecial2;

  ngOnInit() {
    this.conectSocket();
  }
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
  async conectSocket() {
    // Subcripción al socket para online

    this.sub = this.webSocketService
      .watchGameMessage(this.gameService.gameDTO()!.gameId)
      .subscribe((msg) => {
        if (!msg) return;
        if (msg.game) this.gameService.setGame(msg.game);
        if (msg.type === 'EXIT') {
          console.log('solo queda ', this.gameService.me(), ' en el juego');
          this.alonePlayer = true;
          this.rivalOutside();
          return;
        }
        // 🗨️ Detectamos si es mensaje de chat
        if (msg.type === 'CHAT') {
          console.log(`[CHAT] ${msg.sender}: ${msg.content}`);
          // Aquí emitiremos o guardaremos el mensaje en el chat
          this.chatMessages.update((prev) => [...prev, msg]);
          return; // 🔥 No seguimos con la lógica del juego
        }
        this.msgSocket.set(msg);
      });
  }

  constructor() {
    effect(() => {
      //ONLINE webSocket
      const _msgSocket = this.msgSocket();
      if (!_msgSocket || !_msgSocket.game) return;
      console.log('MSG SOCKET: ', _msgSocket);

      // // 💥 --- LÓGICA PARA ESPECIALES ONLINE --- 💥

      // // 1. Si el backend devuelve multiShotResults → aplicar cada disparo
      // if (_msgSocket.type === 'SPECIAL' && _msgSocket.multiShotResults) {
      //   console.log(
      //     '>>> Recibido SPECIAL con multiShotResults:',
      //     _msgSocket.multiShotResults
      //   );

      //   for (const shot of _msgSocket.multiShotResults) {
      //     this.lastShot = shot; // reutilizo tu sistema
      //     if (shot.hit) {
      //       this.audioService.play('hitSound', '/audio/hitSound.mp3');
      //       if (shot.destroyed) {
      //         this.audioService.play(
      //           'destroyedSound',
      //           '/audio/destroyedSound.mp3'
      //         );
      //       }
      //     }
      //     if (shot.miss) {
      //       this.audioService.play('missSound', '/audio/missSound.mp3');
      //     }
      //   }

      //   // Actualizamos game completo del backend
      //   this.gameService.setGame(_msgSocket.game);

      //   // Actualizar turno
      //   const me = this.gameService.me();
      //   this.gameService.isMyTurn.set(_msgSocket.game.turn === me);

      //   return; // 🔥 IMPORTANTE: no continuar con la lógica normal
      // }

      // // 2. Activación del especial (no lleva todavía multiShotResults)
      // if (_msgSocket.type === 'SPECIAL' && !_msgSocket.multiShotResults) {
      //   console.log('>>> SPECIAL recibido — activando especial');

      //   const game = _msgSocket.game;
      //   const me = this.gameService.me();
      //   // Averiguar qué especial está activo ahora mismo
      //   const specials =
      //     me === 'player1' ? game.specialPlayer1 : game.specialPlayer2;

      //   if (!specials?.activeSpecial1 && !specials?.activeSpecial2) return;
      //   if (specials.activeSpecial1) {
      //     this.getSpecialActive(specials.special1, 1);
      //     me === 'player1'
      //       ? this.specialService.readyPlayerSpecial1.set(true)
      //       : this.specialService.readyPlayerRivalSpecial1.set(true);
      //   } else if (specials.activeSpecial2) {
      //     this.getSpecialActive(specials.special2, 2);
      //   }

      //   //   {
      //   //   console.log('Activado multiShot → generando disparo automático');
      //   //   this.procesarMultiShot(game);
      //   //   return;
      //   // }

      //   // SPECIAL 3 (laserShot) → igual que multi pero vertical
      //   // if (specials.activeSpecial3) {
      //   //   console.log('Activado laserShot → disparo láser automático');
      //   //   this.procesarLaser(game);
      //   //   return;
      //   // }

      //   // SPECIAL 2 → doble disparo (x2Shot)
      //   // if (specials.activeSpecial2) {
      //   //   console.log('Activado x2Shot → permitir segundo disparo');
      //   //   this.gameService.allowSecondShot.set(true);
      //   //   return;
      //   // }
      // }
      untracked(async () => {
        if (_msgSocket.lastShot) this.lastShot = _msgSocket.lastShot;
        this.updateBoard.set(true);
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
          if (_msgSocket.type !== 'SPECIAL') {
            //Consigo el turno anterior para que la vista no cambie para que de tiempo a animaciones
            //COPIA PROFUNDA
            this.gameTurnBack = structuredClone(this.msgSocket().game!);
            this.turnBack =
              this.msgSocket().game!.turn! === 'player1'
                ? 'player2'
                : 'player1';
            this.gameTurnBack.turn = this.turnBack;
            this.gameService.setGame(this.gameTurnBack);
            await sleep(1800); // da tiempo a animacion
            this.gameService.setGame(_msgSocket.game!); //Se Actualiza para cambiar turno
          } else {
            this.audioService.play('missSound', '/audio/missSound.mp3');
          }
        }
        await sleep(300); // da tiempo a animacion

        if (_msgSocket.game!.phase === 'END') {
          await sleep(1000); // da tiempo a ver el final
          this.audioService.stopAll();

          const winner = _msgSocket.game!.winner;
          const me = this.gameService.me();
          const game = _msgSocket.game!;

          const iAmWinner = winner === me;
          const avatar =
            winner === 'player1' ? game.avatarPlayer1 : game.avatarPlayer2;

          const winnerNick = winner === 'player1' ? game.player1 : game.player2;

          const title = iAmWinner ? '¡VICTORIA!' : 'DERROTA';
          const coin = iAmWinner ? '500' : '100';

          const textColor = iAmWinner ? '#39ff14' : '#a91504';
          iAmWinner
            ? this.audioService.play('win', '/audio/win.mp3')
            : this.audioService.play(
                'placement',
                `${this.baseUrl}/media/audio/loose.mp3?t=${Math.random()}`, //para evitar cache
                true,
                0.2
              );
          this.audioService.play('coins', '/audio/coins.mp3');
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
          this.audioService.stopAll();
          this.audioService.play(
            'menu2',
            `${this.baseUrl}/media/audio/menu2.mp3?t=${Math.random()}`, //para evitar cache
            true,
            0.2
          );
          // Actualizar stats y borrar gameDTO
          let _perfil = this.perfil();
          iAmWinner
            ? ((_perfil.stats.wins as number) += 1)
            : ((_perfil.stats.losses as number) += 1);
          (_perfil.stats.coins as number) += parseInt(coin);
          this.perfilService.setPerfil(_perfil);
          this.perfilService.updatePerfil(_perfil);

          this.storage.remove('gameDTO');
          this.pageChange.emit('MENU');
          return;
        }
        if (_msgSocket.type === 'SPECIAL') {
          this.getSpecialActive(_msgSocket.game!);
          

          return;
        }

        if (
          _msgSocket.game?.readyPlayer1 &&
          _msgSocket.game?.readyPlayer2 &&
          _msgSocket.phase === 'PLACEMENT'
        ) {
          _msgSocket.game.phase = 'BATTLE';
          this.audioService.stopAll();
          const theme = this.audioService.randomMusic();
          this.audioService.play(
            theme,
            `${this.baseUrl}/media/audio/${theme}.mp3?t=${Math.random()}`,
            true,
            0.3
          );
          await this.gameService.setGame(
            (
              await this.gameService.updateGame(_msgSocket.game)
            ).datos
          );
          this.page.set('BATTLE');
        }

        //Cambio el turno

        const me = this.gameService.me();
        this.gameService.isMyTurn.set(_msgSocket.game!.turn === me);
      });
    });

    effect(() => {
      if (this.exitGame()) {
        console.log('EXITING GAME ...............');
        this.pageChange.emit('MENU');
      }
    });
  }

  getSpecialActive(game: Game) {
    const me = this.gameService.me();
    if (me === 'player1') {
      this.slot1Player1Ready.set(game.specialPlayer1?.activeSpecial1!);
      this.slot2Player1Ready.set(game.specialPlayer1?.activeSpecial2!);
    } else {
      this.slot1Player2Ready.set(game.specialPlayer2?.activeSpecial1!);
      this.slot2Player2Ready.set(game.specialPlayer2?.activeSpecial2!);
    }
   
  }
  //   const me = this.gameService.me();

  //   }

  //   switch (nameSpecial) {
  //     case 'x2Shot':
  //       // continua disparando normal
  //       break;
  //     case 'multiShot':
  //       break;
  //     case 'laserShot':
  //       break;
  //   }
  // }

  async playerFire(pos: string) {
    const me = this.gameService.me()!;
    const gameId = this.gameService.gameDTO()!.gameId;
    this.gameService.shoot(gameId, me, pos);
    console.log(`[ONLINE] ${me} dispara en ${pos}`);
  }

  sendChatMessage(content: string) {
    const message: GameMessage = {
      type: 'CHAT',
      sender: this.gameService.me(),
      content,
      timestamp: new Date().toISOString(),
    };

    this.webSocketService.sendChat(this.gameService.gameDTO()!.gameId, message);
  }

  async cancelar() {
    this.exitGame.set(true);
    const _resp = await this.gameService.exitGame(
      this.gameService.gameDTO()?.gameId!
    );
    if (_resp) console.log('Se envió señal al socket de EXIT');

    this.audioService.stopAll();
    this.audioService.play(
      'menu2',
      `${this.baseUrl}/media/audio/menu2.mp3`,
      true,
      0.2
    );
    const _game = this.gameService.gameDTO();
    _game?.gameId === null;
    this.gameService.setGame(_game!);
  }

  async rivalOutside() {
    console.log('En rivalOutside alonePlayer --> ', this.alonePlayer);
    await sleep(1000);
    if (this.alonePlayer) {
      const _game = this.gameService.gameDTO()!;
      const me = this.gameService.me(); //winner
      const reward = '500';
      await Swal.fire({
        title: '¡VICTORIA!',
        html: `
                <p class="text-lg text-[#39ff14]">
                <span class="text-fluor text-xl font-bold font-mono">
                ${me === 'player1' ? _game.player1 : _game.player2}
                </span> Ha ganado 
                </p>
                <p class="text-yellow-400 font-bold mt-2">
                <span class="text-red-800 text-xl font-bold font-mono">
                ${me === 'player1' ? _game.player2 : _game.player1}
                </span> ha abandonado el juego...
                Has ganado <span class="text-xl">${reward} 🪙</span>
                </p>
                `,
        imageUrl: `${
          me === 'player1' ? _game.avatarPlayer1 : _game.avatarPlayer2
        }`,
        imageWidth: 140,
        imageHeight: 140,
        imageAlt: 'Avatar ganador',
        customClass: {
          popup: 'bg-principal text-fluor rounded-2xl shadow-black shadow-lg',
          image:
            'rounded-full shadow-black shadow-lg border-4 border-yellow-500',
          confirmButton:
            'bg-btn hover:bg-yellow-600 cursor-pointer text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
          title: 'swal-title-green',
        },
        buttonsStyling: false,
        confirmButtonText: 'Aceptar',
      });
      this.pageChange.emit('MENU');
    }
  }
}
