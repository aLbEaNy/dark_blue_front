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
  private baseUrl = window.__env.backendUrl;
  msgSocket = signal<GameMessage>({ phase: 'PLACEMENT' });
  perfilService = inject(PerfilService);
  perfil = this.perfilService.perfil;
  pageChange = output<string>(); // hacia main
  page = signal('PLACEMENT'); // Para los hijos
  chatMessages = signal<GameMessage[]>([]);
  exitGame = signal(false);
  alonePlayer = false;

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
   ngOnDestroy() {
    this.sub?.unsubscribe();
  }
  async conectSocket() {
    // Subcripción al socket para online

    this.sub = this.webSocketService
      .watchGameMessage(this.gameService.gameDTO()!.gameId)
      .subscribe((msg) => {
        if (!msg) return;

        if(msg.type === 'EXIT'){
          console.log('solo queda ',this.gameService.me(),' en el juego');
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

        // Si no es chat, es mensaje del juego
        console.log(
          `>>>----> Mensaje del topic en online-game: con gameId ${
            this.gameService.gameDTO()!.gameId
          }`,
          msg
        );
        this.msgSocket.set(msg);
      });
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

  constructor() {
    effect(() => {
      //ONLINE webSocket
      const _msgSocket = this.msgSocket();
      if (!_msgSocket || !_msgSocket.game) return;
      console.log('# # # - msgSocket vale: ', _msgSocket);
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
          this.turnBack = this.msgSocket().game!.turn! === 'player1' ? 'player2' : 'player1';
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

  async rivalOutside(){
    console.log('En rivalOutside alonePlayer --> ', this.alonePlayer);
    await sleep(1000);
    if(this.alonePlayer){
      
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
                  imageUrl: `${me === 'player1' ? _game.avatarPlayer1: _game.avatarPlayer2}`,
                  imageWidth: 140,
                  imageHeight: 140,
                  imageAlt: 'Avatar ganador',
                  customClass: {
                    popup:
                      'bg-principal text-fluor rounded-2xl shadow-black shadow-lg',
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
