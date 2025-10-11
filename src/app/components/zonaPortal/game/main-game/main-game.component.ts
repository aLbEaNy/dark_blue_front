import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { BoardComponent } from '../board/board.component';
import { MenuComponent } from '../menu/menu.component';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import { AudioService } from '../../../../services/audio/audio.service';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { GameService } from '../../../../services/game/game.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { MiniDisplayUserComponent } from '../mini-display-user/mini-display-user.component';
import { MiniPlacementComponent } from '../mini-placement/mini-placement.component';
import { MiniBoardComponent } from '../mini-board/mini-board.component';
import { BoardAtackComponent } from '../board-atack/board-atack.component';
import { AIService } from '../../../../services/game/ai.service';
import { sleep } from '../../../../utils/board-utils';
import Swal from 'sweetalert2';
import { WaitingOnlineComponent } from '../waiting-online/waiting-online.component';
import { WebSocketService } from '../../../../services/webSocket/webSocket.service';
import GameMessage from '../../../../models/GameMessage';
import { OnlineGameComponent } from '../online-game/online-game.component';
import { Router } from '@angular/router';
import { PagesService } from '../../../../services/pages/pages.service';
import { PerfilService } from '../../../../services/game/perfil.service';

@Component({
  selector: 'app-main-game',
  imports: [
    MenuComponent,
    BoardComponent,
    HeaderComponent,
    FooterComponent,
    MiniDisplayUserComponent,
    MiniPlacementComponent,
    MiniBoardComponent,
    BoardAtackComponent,
    WaitingOnlineComponent,
    OnlineGameComponent,
  ],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css',
})
export class MainGameComponent implements OnInit {
  router = inject(Router);
  audioService = inject(AudioService);
  storage = inject(StorageService);
  gameService = inject(GameService);
  aiService = inject(AIService);
  pagesService = inject(PagesService);
  perfilService = inject(PerfilService);
  webSocketService = inject(WebSocketService);
  private sub?: Subscription;
  msgSocket = signal<GameMessage>({ phase: 'PLACEMENT' });
  private baseUrl = window.__env.backendUrl;

  perfil = this.perfilService.perfil;
  page = signal('');
  pages = this.pagesService.pages;

  ngOnInit() {
    // Reproduce el audio al cargar el componente
    this.audioService.play(
      'menu2',
      `${this.baseUrl}/media/audio/menu2.mp3`,
      true,
      0.7
    );
  }

  constructor() {
    //Según el valor de page dispara la nueva partida
    effect(() => {
      const _page = this.page();
      console.log('page vale: ', _page);
      untracked(() => {
        if (_page === 'NEWGAME') {
          this.newGame();
        }
        if (_page === 'START') {
          this.startBattle();
        }
        if (_page === 'OPTIONS') {
          this.pages.set('OPTIONS');
          this.router.navigate(['/darkblue/options']);
        }        
        if (_page === 'WAITING_READY') {
          console.log(`Effect en WAITING_READY con ${this.gameService.me()}`);
        }
        if (_page === 'SALIR') {
          //Volver a home cerrando sesion
          this.storage.clear();
          sessionStorage.clear();
         
          this.router.navigate(['/home']);
        }
      });
    });
  }

  async newGame() {
    try {
      const resp = await firstValueFrom(
        this.gameService.newGame(
          this.perfil().nickname,
          false,
          this.gameService.gameDTO()?.gameId || ''
        )
      );
      if (resp.codigo === 0) {
        await this.gameService.setGame(resp.datos);

        await sleep(500);
        console.log(
          '>>> despierto después del sleep en newGame(), phase:',
          this.gameService.gameDTO()?.phase
        );
        //OFFLINE
        await Swal.fire({
          title: `STAGE-${resp.datos.stage}`,
          html: `
      <p class="text-lg text-[#ff9114]">
        ¡Sobrevive al ataque de 
        <span class="text-red-800 font-bold">${resp.datos.player2}</span>!
      </p>
    `,
          imageUrl: `${resp.datos.avatarPlayer2}`,
          imageWidth: 140,
          imageHeight: 140,
          imageAlt: 'Avatar rival',
          customClass: {
            popup: 'bg-principal text-fluor rounded-2xl shadow-black shadow-lg',
            image:
              'rounded-full shadow-black shadow-lg border-4 border-yellow-500',
            confirmButton:
              'bg-btn hover:bg-yellow-600 text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
            title: 'swal-title-green',
          },
          buttonsStyling: false,
          timer: 2300,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error('Error en newGame:', err);
    }
  }

  async startBattle() {
      let _game = this.gameService.gameDTO()!;
      _game.phase = 'BATTLE';
      await this.gameService.setGame(_game);
      this.page.set('BATTLE');
      this.nextTurn();
  }

  async aiTurn() {
    let _game = this.gameService.gameDTO()!;

    if (_game.phase === 'END') return;
    if (_game.turn !== 'player2') return;

    let continueTurn = true;

    while (continueTurn) {
      await sleep(1500);
      if (this.gameService.gameDTO()?.phase !== 'BATTLE') return;

      // IA dispara → devuelve un board NUEVO (inmutable)
      const board1 = this.aiService.fire(_game.boardPlayer1);

      // Actualiza gameDTO y signal
      _game = { ..._game, boardPlayer1: board1 };
      this.gameService.setGame(_game);
      this.gameService.shotsInBoard1.set([...board1.shots]);

      // Espera un frame para que Angular pinte
      await new Promise((res) => requestAnimationFrame(() => res(0)));

      // Último disparo
      const lastShot = board1.shots[board1.shots.length - 1];
      continueTurn = lastShot.result === 'HIT';
      if (continueTurn) {
        this.audioService.play('hitSound', '/audio/hitSound.mp3');
        await sleep(200);
        if (this.gameService.gameDTO()?.phase !== 'BATTLE') return;
      } else {
        this.audioService.play('missSound', '/audio/missSound.mp3');
        // Pequeña pausa visible para el jugador
        await sleep(1800);
        if (this.gameService.gameDTO()?.phase !== 'BATTLE') return;
      }
      if (
        _game.boardPlayer1.submarines.findIndex(
          (sub) =>
            sub.positions.some((pos) => pos === lastShot.position) &&
            sub.isDestroyed
        ) !== -1
      )
        this.audioService.play('destroyedSound', '/audio/destroyedSound.mp3');
      await sleep(200);
      if (this.gameService.gameDTO()?.phase !== 'BATTLE') return;
      // --- COMPROBAR FIN DE PARTIDA ---
      if (board1.submarines.every((sub) => sub.isDestroyed)) {
        _game.winner = 'player2';
        _game.phase = 'END';
        this.gameService.setGame(_game);
        this.gameService.updateGame(_game);
        this.storage.remove('gameDTO');

        console.log('FIN DE PARTIDA');
        // Mostrar banner o popup de victoria de la IA
        await Swal.fire({
          title: 'DERROTA!!',
          text: `${this.gameService.gameDTO()?.player2} ha ganado!`,
          imageUrl: `${_game.avatarPlayer2}`,
          imageWidth: 140,
          imageHeight: 140,
          imageAlt: 'Avatar ganador',
          customClass: {
            popup:
              'bg-principal text-red-800 rounded-2xl shadow-black shadow-lg', // fondo del modal
            image:
              'rounded-full shadow-black shadow-lg border-4 border-yellow-500',
            confirmButton:
              'bg-btn hover:bg-yellow-600 text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
          },
          buttonsStyling: false, // necesario para que respete tus clases en el botón
          confirmButtonText: 'Aceptar',
        });
        this.page.set('MENU');
      }
    }

    // Cambiar turno al jugador humano
    _game = { ..._game, turn: 'player1' };
    this.gameService.setGame(_game);
    this.gameService.isMyTurn.set(true);
    this.gameService.getCurrentBoard.set(_game.boardPlayer2);
  }

  async nextTurn() {
    console.log('>>>----------> Entro en nextTurn');
    const _game = this.gameService.gameDTO()!;
    
    if (_game.turn === 'player1') {
      // Solo habilitar la UI, esperar clics del jugador
      // No hacemos nada más aquí; playerFire() llamará nextTurn() cuando haga MISS
      return;
    }

    if (_game.turn === 'player2') {
      // Turno de IA
      await this.aiTurn();
      // Al finalizar, nextTurn() se llamará de nuevo para pasar el turno al player1
      if (this.gameService.gameDTO()?.phase !== 'BATTLE') return;
      await this.nextTurn();
    }
  }

  async playerFire(pos: string) {
    // Evita disparos rápidos despues del fin en MISS
    const me = this.gameService.me();
    const boardRival = this.gameService.getCurrentBoard()!;

    if (boardRival.submarines.every((sub) => sub.isDestroyed)) return;

    console.log('>>>-----------> Entro en playerFire');
    console.log('Disparo en posición:', pos);

    let _game = this.gameService.gameDTO()!;

    if (_game.turn !== me) return;

    let result: 'HIT' | 'MISS' = 'MISS';
    for (const sub of boardRival.submarines) {
      const index = sub.positions.indexOf(pos);
      if (index !== -1) {
        result = 'HIT';
        sub.isTouched[index] = true;
        this.audioService.play('hitSound', '/audio/hitSound.mp3');
        if (sub.isTouched.every((t) => t)) {
          sub.isDestroyed = true;
          this.audioService.play('destroyedSound', '/audio/destroyedSound.mp3');
        }
        break;
      }
    }
    if (result === 'MISS') {
      this.audioService.play('missSound', '/audio/missSound.mp3');
    }

    boardRival.shots.push({ position: pos, result });
    this.gameService.setGame(_game);
    this.gameService.shotsInBoard2.set([..._game.boardPlayer2.shots]);
    await sleep(1800); // da tiempo a animacion
    if (this.gameService.gameDTO()?.phase !== 'BATTLE') return;
    if (result === 'MISS') {
      _game.turn = 'player2';
      this.gameService.setGame(_game);
      this.gameService.isMyTurn.set(false);
      this.gameService.getCurrentBoard.set(_game.boardPlayer1); // Llamar al loop de turnos
      this.nextTurn();
    }

    // Comprobar fin de partida
    if (_game.boardPlayer2.submarines.every((sub) => sub.isDestroyed)) {
      console.log('FIN DE PARTIDA');
      _game.winner = 'player1';
      _game.phase = 'END';
      this.gameService.setGame(_game);
      //TODO Guardar juego en bd 
      this.gameService.updateGame(_game);
      let _perfil = this.perfil();
      (_perfil.stats.coins as number) += 100;
      (_perfil.stats.wins as number) += 1;
      this.perfilService.setPerfil(_perfil);
      this.perfilService.updatePerfil(_perfil);

      // Mostrar banner o popup de victoria del jugador
      await Swal.fire({
        title: '¡VICTORIA!',
        html: `
          <p class="text-lg text-[#39ff14]">
          <span class="text-fluor text-xl font-bold font-mono">${
            this.gameService.gameDTO()?.player1
          }</span> ganó a <span class="text-red-800 text-xl font-bold font-mono">${
            this.gameService.gameDTO()?.player2}</span>
          </p>
          <p class="text-yellow-400 font-bold mt-2">
          Has ganado <span class="text-xl">100 🪙</span>
          </p>
          `,
        imageUrl: `${_game.avatarPlayer1}`,
        imageWidth: 140,
        imageHeight: 140,
        imageAlt: 'Avatar ganador',
        customClass: {
          popup: 'bg-principal text-fluor rounded-2xl shadow-black shadow-lg',
          image:
            'rounded-full shadow-black shadow-lg border-4 border-yellow-500',
          confirmButton:
            'bg-btn hover:bg-yellow-600 text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
          title: 'swal-title-green',
        },
        buttonsStyling: false,
        confirmButtonText: 'Aceptar',
      });
      this.page.set('NEWGAME');

      return; // se sale de playerFire
    }
    // Si fue HIT y hay submarinos todavía, el jugador sigue disparando; no se cambia turno
  }
 
}
