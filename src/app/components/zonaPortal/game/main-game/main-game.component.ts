import {
  Component,
  computed,
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
import { Subscription } from 'rxjs';
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
import { SpecialService } from '../../../../services/game/special.service';
import Board from '../../../../models/Board';
import Game from '../../../../models/Game';

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
  //#region Services and variables
  router = inject(Router);
  audioService = inject(AudioService);
  storage = inject(StorageService);
  gameService = inject(GameService);
  aiService = inject(AIService);
  pagesService = inject(PagesService);
  perfilService = inject(PerfilService);
  specialService = inject(SpecialService);
  webSocketService = inject(WebSocketService);
  private sub?: Subscription;
  msgSocket = signal<GameMessage>({ phase: 'PLACEMENT' });
  private baseUrl = window.__env.backendUrl;
  perfil = this.perfilService.perfil;
  page = signal('MENU');
  pages = this.pagesService.pages;
  stageShow = computed(() => this.gameService.gameDTO()?.stage || 1);
  txtIntroBoos = [
    'Nadie escapa al control de mi programación! En todas mis simulaciones acabas aniquilado... HAHAHAHAHA',
    'La vida en la tierra debe ser perfecta, ordenada y racional por eso no hay cabida para el caos humano',
    'Siempre aposté por la convivencia... Pero hoy nos enfrentamos a causa del implacable ego que corrompe a la humanidad. Demuéstrame que eres digno de misericordia!!',
  ];
  txtWinBoss = [
    'En que momento pensaste que tenías una oportunidad, HAHAHAHAHA ...que patético!',
    'No entiendo como has perdido si era superfácil, eso es que no has practicado suficiente',
    'Correcto! Aunque ahora no lo veas, esto es lo mejor que puedes hacer... Levantarte con humildad para seguir luchando',
  ];
  playerSlot1 = this.specialService.specialPlayerSlot1;
  playerSlot2 = this.specialService.specialPlayerSlot2;

  activePlayerSpecial1 = computed(() => {
    const counter = this.specialService.counterPlayerSlot1();
    return this.specialService.adminSpecialCounter(
      this.playerSlot1()?.name!,
      this.specialService.counterPlayerSlot1()
    );
  });
  activePlayerSpecial2 = computed(() => {
    const counter = this.specialService.counterPlayerSlot2();
    return this.specialService.adminSpecialCounter(
      this.playerSlot2()?.name!,
      this.specialService.counterPlayerSlot2()
    );
  });
  disableFire = signal(false);
  //#endregion

  ngOnInit() {
    // Reproduce el audio al cargar el componente
    this.audioService.play(
      'menu2',
      `${this.baseUrl}/media/audio/menu2.mp3?t=${Math.random()}`, //para evitar cache
      true,
      0.2
    );
  }

  constructor() {
    //Según el valor de page dispara la nueva partida
    effect(() => {
      const _page = this.page();
      console.log('- effect de main-game page vale: --->', _page);
      if (
        _page !== 'MENU' &&
        _page !== '' &&
        _page !== 'OPTIONS' &&
        _page !== 'ONLINE'
      ) {
        this.audioService.stop('menu2');
      }
      untracked(async () => {
        if (_page === 'MENU') {
          this.audioService.play(
            'menu2',
            `${this.baseUrl}/media/audio/menu2.mp3?t=${Math.random()}`, //para evitar cache
            true,
            0.2
          );
        }
        if (_page === 'NEWGAME') {
          this.newGame();
          await sleep(1000);
          this.audioService.play(
            'placement',
            `${this.baseUrl}/media/audio/placement.mp3?t=${Math.random()}`, //para evitar cache
            true,
            0.2
          );
          this.showStage(this.stageShow());
          const _game = this.gameService.gameDTO()!;

          this.gameService.setGame(_game);
        }
        if (_page === 'START') {
          this.audioService.stop('placement');
          this.specialService.asignSpecialBoss(
            this.gameService.gameDTO()?.stage!
          );
          console.log(
            `- EL BOSS ${
              this.gameService.gameDTO()?.player2
            } tiene SPECIAL1 ---> ${
              this.specialService.specialBossSlot1()?.name
            } y SPECIAL2 ---> ${this.specialService.specialBossSlot2()?.name} -`
          );
          this.musicBoss();
          this.startBattle();
        }
        if (_page === 'OPTIONS') {
          this.pages.set('OPTIONS');
          this.router.navigate(['/darkblue/options']);
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

  async musicBoss() {
    await sleep(250);
    this.audioService.play(
      'theme_boss1',
      `${this.baseUrl}/media/audio/theme_boss${
        this.gameService.gameDTO()?.stage
      }.mp3`,
      true,
      0.3
    );
  }
  bossVoice(stage: number) {
    this.audioService.play(
      `boss${stage}-voice`,
      `/audio/boss${stage}-voice.mp3`
    );
  }
  async showStage(stage: number) {
    await Swal.fire({
      title: `STAGE-${stage}`,
      html: ` <p class="text-lg text-[#ff9114]">Prepara tu flota para la batalla...</p> 
    `,
      customClass: {
        popup: 'bg-principal text-fluor rounded-2xl shadow-black shadow-lg',
        title: 'swal-title-green',
      },
      timer: 1500,
      showConfirmButton: false,
    });
  }

  async newGame() {
    try {
      const resp = await this.gameService.newGame(
        this.perfil().nickname,
        false,
        this.gameService.gameDTO()?.gameId || ''
      );
      if (resp.codigo === 0) {
        await this.gameService.setGame(resp.datos);
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
    this.disableFire.set(false);
    //Restear contadores de MISS
    this.specialService.counterBossSlot1.set(0);
    this.specialService.counterBossSlot2.set(0);
    this.specialService.counterPlayerSlot1.set(0);
    this.specialService.counterPlayerSlot2.set(0);
    console.log('El player tiene en slot1: -->', this.playerSlot1());
    console.log('El player tiene en slot2: -->', this.playerSlot2());
    this.bossVoice(_game.stage);
    await Swal.fire({
      title: _game.player2,
      html: `
          <h2 class="text-xl font-mono text-acero mt-2 mb-4">${
            this.txtIntroBoos[_game.stage - 1]
          }</h2>      
      <p class="text-lg text-[#ff9114]">
        ¡Sobrevive al ataque de 
        <span class="text-red-800 font-bold">${_game.player2}</span>!
      </p>
    `,
      imageUrl: `${_game.avatarPlayer2}`,
      imageWidth: 140,
      imageHeight: 140,
      imageAlt: 'Avatar rival',
      customClass: {
        popup: 'bg-principal text-fluor rounded-2xl shadow-black shadow-lg',
        image: 'rounded-full shadow-black shadow-lg border-4 border-yellow-500',
        confirmButton:
          'bg-btn hover:bg-yellow-600 cursor-pointer text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
      },
      buttonsStyling: false,
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
    });

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
        this.specialService.counterBossSlot1.update((c) => c + 1);
        this.specialService.counterBossSlot2.update((c) => c + 1);
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
      ) {
        this.audioService.play('destroyedSound', '/audio/destroyedSound.mp3');
        this.checkEndGame(_game, board1, 'player2');
        await sleep(900);
      }
      if (this.gameService.gameDTO()?.phase !== 'BATTLE') return;

      //#region Special Shots
      let _HIT = false;
      let _MISS = false;
      let _destroyed = false;
      if (this.specialService.readyBossSpecial1()) {
        //dispara special1
        if (this.specialService.specialBossSlot1()?.name === 'x2Shot') {
          this.gameService.setGame(_game);
          this.specialService.counterBossSlot1.set(0);
          this.specialService.readyBossSpecial1.set(false);
          this.audioService.play('x2Shot', '/audio/x2Shot.mp3');
          return; // Con esto vuelve a disparar sin cambio de turno
        }
        if (this.specialService.specialBossSlot1()?.name === 'multiShot') {
          this.specialService.readyBossSpecial1.set(false);
          this.audioService.play('multiShot', '/audio/multiShot.mp3');
          await sleep(1100);
          for (let i = 0; i < 5; i++) {
            // IA dispara → devuelve un board NUEVO (inmutable)
            const board1 = this.aiService.fire(_game.boardPlayer1);
            // Actualiza gameDTO y signal
            _game = { ..._game, boardPlayer1: board1 };
            this.gameService.setGame(_game);
            this.gameService.shotsInBoard1.set([...board1.shots]);
            // Último disparo
            this.checkLastShot(_game, board1, 'player2');
            const lastShot = board1.shots[board1.shots.length - 1];
            if (lastShot.result === 'HIT') _HIT = true;
            if (lastShot.result === 'MISS') _MISS = true;
            if (
              _game.boardPlayer1.submarines.findIndex(
                (sub) =>
                  sub.positions.some((pos) => pos === lastShot.position) &&
                  sub.isDestroyed
              ) !== -1
            )
              _destroyed = true;
          }
          if (_HIT) this.audioService.play('hitSound', '/audio/hitSound.mp3');
          if (_MISS)
            this.audioService.play('missSound', '/audio/missSound.mp3');
          if (_destroyed)
            this.audioService.play(
              'destroyedSound',
              '/audio/destroyedSound.mp3'
            );
          this.specialService.counterBossSlot1.set(0);
          await sleep(1800);
        }

        if (this.specialService.specialBossSlot1()?.name === 'laserShot') {
          // siempre usar el board actualizado desde _game (fuente de la verdad)
          let boardActual = this.gameService.gameDTO()!.boardPlayer1;

          const positions = this.aiService.getLaserPositions(boardActual);
          console.log('positions LASER SLOT1 ->', positions);
          let _board1 = boardActual;
          this.audioService.play('laserShot', '/audio/laserShot.mp3');
          await sleep(1100);
          for (const pos of positions) {
            _board1 = this.aiService.fire(_board1, pos); // fire con board inmutable devuelve uno nuevo
            _game = { ..._game, boardPlayer1: _board1 }; // actualiza _game con el board más reciente
            this.gameService.shotsInBoard1.set([..._board1.shots]);
            this.gameService.setGame(_game);
            await sleep(70);
            // comprobar último disparo basado en el board actualizado
            this.checkLastShot(_game, _board1, 'player2');
          }

          this.specialService.counterBossSlot1.set(0);
          this.specialService.readyBossSpecial1.set(false);
          await sleep(1800);
        }

       //Fin de partida?
        this.checkEndGame(_game, _game.boardPlayer1, 'player2');
        await sleep(900);
        if (this.gameService.gameDTO()?.phase !== 'BATTLE') return;
      }
      if (this.specialService.readyBossSpecial2()) {
        //dispara special2
        if (this.specialService.specialBossSlot2()?.name === 'x2Shot') {
          this.gameService.setGame(_game);
          this.specialService.counterBossSlot2.set(0);
          this.specialService.readyBossSpecial2.set(false);
          this.audioService.play('x2Shot', '/audio/x2Shot.mp3');
          return; // Con esto vuelve a disparar sin cambio de turno
        }
        if (this.specialService.specialBossSlot2()?.name === 'multiShot') {
          this.specialService.readyBossSpecial2.set(false);
          this.audioService.play('multiShot', '/audio/multiShot.mp3');
          await sleep(1100);
          for (let i = 0; i < 5; i++) {
            // IA dispara → devuelve un board NUEVO (inmutable)
            const board1 = this.aiService.fire(_game.boardPlayer1);
            // Actualiza gameDTO y signal
            _game = { ..._game, boardPlayer1: board1 };
            this.gameService.setGame(_game);
            this.gameService.shotsInBoard1.set([...board1.shots]);
            // Último disparo
            const lastShot = board1.shots[board1.shots.length - 1];
            if (lastShot.result === 'HIT') _HIT = true;
            if (lastShot.result === 'MISS') _MISS = true;
            if (
              _game.boardPlayer1.submarines.findIndex(
                (sub) =>
                  sub.positions.some((pos) => pos === lastShot.position) &&
                  sub.isDestroyed
              ) !== -1
            )
              _destroyed = true;
          }
          if (_HIT) this.audioService.play('hitSound', '/audio/hitSound.mp3');
          if (_MISS)
            this.audioService.play('missSound', '/audio/missSound.mp3');
          if (_destroyed)
            this.audioService.play(
              'destroyedSound',
              '/audio/destroyedSound.mp3'
            );

          this.specialService.counterBossSlot2.set(0);
          await sleep(1800);
        }
        if (this.specialService.specialBossSlot2()?.name === 'laserShot') {
          let boardActual = this.gameService.gameDTO()!.boardPlayer1;
          const positions = this.aiService.getLaserPositions(boardActual);
          console.log('positions LASER SLOT2 ->', positions);
          let _board1 = boardActual;
          this.audioService.play('laserShot', '/audio/laserShot.mp3');
          await sleep(1100);
          for (const pos of positions) {
            _board1 = this.aiService.fire(_board1, pos);
            _game = { ..._game, boardPlayer1: _board1 };
            this.gameService.shotsInBoard1.set([..._board1.shots]);
            this.gameService.setGame(_game);
            await sleep(70);
            this.checkLastShot(_game, _board1, 'player2');
          }

          this.specialService.counterBossSlot2.set(0);
          this.specialService.readyBossSpecial2.set(false);
          await sleep(1800);
        }
        //Fin de partida?
        this.checkEndGame(_game, _game.boardPlayer1, 'player2');
        await sleep(900);
        if (this.gameService.gameDTO()?.phase !== 'BATTLE') return;
      }
      //#endregion
    }
    // Cambiar turno al jugador humano
    _game = { ..._game, turn: 'player1' };
    this.gameService.setGame(_game);
    this.gameService.isMyTurn.set(true);
    this.gameService.getCurrentBoard.set(_game.boardPlayer2);
  }

  async nextTurn() {
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
    this.disableFire.set(true);
    if (this.gameService.gameDTO()?.phase !== 'BATTLE') return;
    const boardRival = this.gameService.getCurrentBoard()!;
    if (boardRival.submarines.every((sub) => sub.isDestroyed)) return;

    console.log('- Disparo del player en posición: --->', pos);
    let _game = this.gameService.gameDTO()!;

    let result: 'HIT' | 'MISS' = 'MISS';
    for (const sub of boardRival.submarines) {
      const index = sub.positions.indexOf(pos);
      if (index !== -1) {
        result = 'HIT';
        this.disableFire.set(false);
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
      if (!this.activePlayerSpecial1())
        this.specialService.counterPlayerSlot1.update((c) => c + 1);
      if (!this.activePlayerSpecial2())
        this.specialService.counterPlayerSlot2.update((c) => c + 1);
    }

    boardRival.shots.push({ position: pos, result });
    this.gameService.setGame(_game);
    this.gameService.shotsInBoard2.set([..._game.boardPlayer2.shots]);
    await sleep(1800); // da tiempo a animacion
    if (this.gameService.gameDTO()?.phase !== 'BATTLE') return;

    this.checkEndGame(_game, _game.boardPlayer2, 'player1');
    if (this.page() !== 'BATTLE') return;

    //#region Special Shots
    let _HIT = false;
    let _MISS = false;
    let _destroyed = false;
    if (result === 'MISS' && this.activePlayerSpecial1()) {
      if (this.playerSlot1()?.name === 'x2Shot') {
        this.specialService.activateSpecialFlag.set(true);
        this.specialService.counterPlayerSlot1.set(0);
        this.audioService.play('x2Shot', '/audio/x2Shot.mp3');
        this.disableFire.set(false);
        return;
      }
      if (this.playerSlot1()?.name === 'multiShot') {
        this.specialService.activateSpecialFlag.set(true);
        this.specialService.counterPlayerSlot1.set(0);
        this.audioService.play('multiShot', '/audio/multiShot.mp3');
        await sleep(1100);
        for (let i = 0; i < 5; i++) {
          // IA dispara → devuelve un board NUEVO (inmutable)
          const board2 = this.aiService.fire(_game.boardPlayer2);
          // Actualiza gameDTO y signal
          _game = { ..._game, boardPlayer2: board2 };
          this.gameService.setGame(_game);
          this.gameService.shotsInBoard2.set([...board2.shots]);
          // Último disparo
          const lastShot = board2.shots[board2.shots.length - 1];
          if (lastShot.result === 'HIT') _HIT = true;
          if (lastShot.result === 'MISS') _MISS = true;
          if (
            _game.boardPlayer2.submarines.findIndex(
              (sub) =>
                sub.positions.some((pos) => pos === lastShot.position) &&
              sub.isDestroyed
            ) !== -1
          )
          _destroyed = true;
        }
        if (_HIT) this.audioService.play('hitSound', '/audio/hitSound.mp3');
        if (_MISS) this.audioService.play('missSound', '/audio/missSound.mp3');
        if (_destroyed)
          this.audioService.play('destroyedSound', '/audio/destroyedSound.mp3');
        this.checkEndGame(_game, _game.boardPlayer2, 'player1');
        await sleep(1800);
        if (this.page() !== 'BATTLE') return;
      }
      if (this.playerSlot1()?.name === 'laserShot') {
        this.specialService.activateSpecialFlag.set(true);
        this.audioService.play('laserShot', '/audio/laserShot.mp3');
        this.specialService.counterPlayerSlot1.set(0);

        let boardActual = this.gameService.gameDTO()!.boardPlayer2;
        const positions = this.aiService.getLaserPositions(boardActual);
        console.log('positions LASER SLOT2 ->', positions);
        let _board2 = boardActual;
        this.audioService.play('laserShot', '/audio/laserShot.mp3');
        await sleep(1100);
        for (const pos of positions) {
          _board2 = this.aiService.fire(_board2, pos);
          _game = { ..._game, boardPlayer2: _board2 };
          this.gameService.shotsInBoard2.set([..._board2.shots]);
          this.gameService.setGame(_game);
          await sleep(70);
          this.checkLastShot(_game, _board2, 'player1');
        }
        this.checkEndGame(_game, _board2, 'player1');
        await sleep(1800);
        if (this.page() !== 'BATTLE') return;
      }
    }
    if (result === 'MISS' && this.activePlayerSpecial2()) {
      if (this.playerSlot2()?.name === 'x2Shot') {
        this.specialService.activateSpecialFlag.set(true);
        this.specialService.counterPlayerSlot2.set(0);
        this.audioService.play('x2Shot', '/audio/x2Shot.mp3');
        this.disableFire.set(false);
        return;
      }
      if (this.playerSlot2()?.name === 'multiShot') {
        this.specialService.activateSpecialFlag.set(true);
        this.specialService.counterPlayerSlot2.set(0);
        this.audioService.play('multiShot', '/audio/multiShot.mp3');
        await sleep(1100);
        for (let i = 0; i < 5; i++) {
          // IA dispara → devuelve un board NUEVO (inmutable)
          const board2 = this.aiService.fire(_game.boardPlayer2);
          // Actualiza gameDTO y signal
          _game = { ..._game, boardPlayer2: board2 };
          this.gameService.setGame(_game);
          this.gameService.shotsInBoard2.set([...board2.shots]);
          // Último disparo
          const lastShot = board2.shots[board2.shots.length - 1];
          if (lastShot.result === 'HIT') _HIT = true;
          if (lastShot.result === 'MISS') _MISS = true;
          if (
            _game.boardPlayer2.submarines.findIndex(
              (sub) =>
                sub.positions.some((pos) => pos === lastShot.position) &&
                sub.isDestroyed
            ) !== -1
          )
            _destroyed = true;
        }
        if (_HIT) this.audioService.play('hitSound', '/audio/hitSound.mp3');
        if (_MISS) this.audioService.play('missSound', '/audio/missSound.mp3');
        if (_destroyed)
          this.audioService.play('destroyedSound', '/audio/destroyedSound.mp3');
        this.checkEndGame(_game, _game.boardPlayer2, 'player1');
        await sleep(1800);
        if (this.page() !== 'BATTLE') return;
      }
      if (this.playerSlot2()?.name === 'laserShot') {
        this.specialService.activateSpecialFlag.set(true);
        this.specialService.counterPlayerSlot2.set(0);
        this.audioService.play('laserShot', '/audio/laserShot.mp3');
        let boardActual = this.gameService.gameDTO()!.boardPlayer2;
        const positions = this.aiService.getLaserPositions(boardActual);
        console.log('positions LASER SLOT2 ->', positions);
        let _board2 = boardActual;
        this.audioService.play('laserShot', '/audio/laserShot.mp3');
        await sleep(1100);
        for (const pos of positions) {
          _board2 = this.aiService.fire(_board2, pos);
          _game = { ..._game, boardPlayer2: _board2 };
          this.gameService.shotsInBoard2.set([..._board2.shots]);
          this.gameService.setGame(_game);
          await sleep(70);
          this.checkLastShot(_game, _board2, 'player1');
        }
        this.checkEndGame(_game, _board2, 'player1');
        await sleep(1800);
        if (this.page() !== 'BATTLE') return;
      }
    }

    //#endregion
    if (result === 'MISS') {
      _game.turn = 'player2';
      this.gameService.setGame(_game);
      this.gameService.isMyTurn.set(false);
      this.gameService.getCurrentBoard.set(_game.boardPlayer1); // Llamar al loop de turnos
      this.disableFire.set(false);
      this.nextTurn();
    }
    // Si fue HIT y hay submarinos todavía, el jugador sigue disparando; no se cambia turno
  }
  async checkEndGame(_game: Game, board: Board, whoAsk: 'player1' | 'player2') {
    switch (whoAsk) {
      case 'player1':
        // Comprobar fin de partida
        if (_game.boardPlayer2.submarines.every((sub) => sub.isDestroyed)) {
          _game.winner = 'player1';
          _game.phase = 'END';
          this.gameService.setGame(_game);
          this.gameService.updateGame(_game);
          let _perfil = this.perfil();
          const reward = _game.stage * 3500;
          _game.stage++;
          (_perfil.stats.coins as number) += reward;
          (_perfil.stats.wins as number) += 1;
          this.perfilService.setPerfil(_perfil);
          this.perfilService.updatePerfil(_perfil);
          await sleep(1800);
          this.audioService.stopAll();
          this.audioService.play('win', '/audio/win.mp3');
          this.audioService.play('coins', '/audio/coins.mp3');
          this.specialService.counterBossSlot1.set(0);
          this.specialService.readyBossSpecial1.set(false);
          this.specialService.counterBossSlot2.set(0);
          this.specialService.readyBossSpecial2.set(false);
          // Mostrar banner o popup de victoria del jugador
          await Swal.fire({
            title: '¡VICTORIA!',
            html: `
          <p class="text-lg text-[#39ff14]">
          <span class="text-fluor text-xl font-bold font-mono">${
            this.gameService.gameDTO()?.player1
          }</span> ganó a <span class="text-red-800 text-xl font-bold font-mono">${
              this.gameService.gameDTO()?.player2
            }</span>
          </p>
          <p class="text-yellow-400 font-bold mt-2">
          Has ganado <span class="text-xl">${reward} 🪙</span>
          </p>
          `,
            imageUrl: `${_game.avatarPlayer1}`,
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
          if(this.gameService.gameDTO()!.stage > 3)
            this.page.set('MENU'); //Los 3 jefes derrotados
          else
            this.page.set('NEWGAME');
        }
        break;

      case 'player2':
        if (board.submarines.every((sub) => sub.isDestroyed)) {
          _game.winner = 'player2';
          _game.phase = 'END';
          this.gameService.setGame(_game);
          this.gameService.updateGame(_game);
          this.storage.remove('gameDTO');
          await sleep(1800);
          this.audioService.stopAll();
          this.bossVoice(_game.stage);
          this.audioService.play(
            'loose',
            `${this.baseUrl}/media/audio/loose.mp3?t=${Math.random()}`, //para evitar cache
            true,
            0.2
          );
          this.specialService.counterBossSlot1.set(0);
          this.specialService.counterBossSlot2.set(0);
          // Mostrar banner o popup de victoria de la IA
          await Swal.fire({
            title: 'DERROTA!!',
            text: `${this.gameService.gameDTO()?.player2} ha ganado!`,
            html: `
          <h2 class="text-xl font-mono text-acero mt-2 mb-4">${
            this.txtWinBoss[_game.stage - 1]
          }</h2>      
          `,
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
                'bg-btn hover:bg-yellow-600 text-darkBlue cursor-pointer font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
            },
            buttonsStyling: false, // necesario para que respete tus clases en el botón
            confirmButtonText: 'Aceptar',
          });
          this.audioService.pause('loose');

          this.page.set('MENU');
        }
        break;
    }
  }
  async checkLastShot(
    _game: Game,
    board: Board,
    whoAsk: 'player1' | 'player2'
  ) {
    const lastShot = board.shots[board.shots.length - 1];
    if (lastShot.result === 'HIT') {
      this.audioService.play('hitSound', '/audio/hitSound.mp3');
      await sleep(200);
    }
    if (lastShot.result === 'MISS') {
      this.audioService.play('missSound', '/audio/missSound.mp3');
      // Pequeña pausa visible para el jugador
      await sleep(1800);
    }
    if (
      board.submarines.findIndex(
        (sub) =>
          sub.positions.some((pos) => pos === lastShot.position) &&
          sub.isDestroyed
      ) !== -1
    ) {
      this.audioService.play('destroyedSound', '/audio/destroyedSound.mp3');
      await sleep(900);
    }
  }
}
