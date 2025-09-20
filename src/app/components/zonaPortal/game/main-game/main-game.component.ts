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
import { firstValueFrom } from 'rxjs';
import { MiniDisplayUserComponent } from '../mini-display-user/mini-display-user.component';
import { MiniPlacementComponent } from '../mini-placement/mini-placement.component';
import { MiniBoardComponent } from '../mini-board/mini-board.component';
import { BoardAtackComponent } from '../board-atack/board-atack.component';
import { AIService } from '../../../../services/game/ai.service';
import { sleep } from '../../../../utils/board-utils';
import Swal from 'sweetalert2';
import { WaitingOnlineComponent } from "../waiting-online/waiting-online.component";
import GameMessage from '../../../../models/GameMessage';

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
    WaitingOnlineComponent
],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css',
})
export class MainGameComponent implements OnInit {
  audioService = inject(AudioService);
  storage = inject(StorageService);
  gameService = inject(GameService);
  aiService = inject(AIService);

  perfil = signal(this.storage.get<any>('perfil'));
  page = signal('');


  ngOnInit() {
    // Reproduce el audio al cargar el componente
    this.audioService.play(
      'menu2',
      'http://localhost:8080/media/audio/menu2.mp3',
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
        }
      });
    });
  }

//   onGameMessage(msg: GameMessage) {
//   switch (msg.phase) {
//     case 'JOINED':
//       this.page.set('PLACEMENT_ONLINE');
//       break;
//     case 'BATTLE':
//       this.page.set('BATTLE');
//       break;
//     case 'END':
//       this.page.set('END');
//       break;
//   }
// }

  async newGame() {
    try {
      const resp = await firstValueFrom(
        // Promise solo se es pera un valor
        this.gameService.newGame(
          this.perfil().nickname,
          false,
          this.gameService.gameDTO()?.gameId || ''
        )
      );

      console.log('Respuesta:', resp);

      if (resp.codigo === 0) {
        this.gameService.setGame(resp.datos);

        await sleep(500);
        console.log(">>> despierto después del sleep en newGame(), phase:", this.gameService.gameDTO()?.phase);
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
          showConfirmButton: false, // Ocultamos el botón ya que se cerrará solo
        });
      }
    } catch (err) {
      console.error('Error en newGame:', err);
    }
  }
  startBattle() {
    console.log('startBattle desde main-game.component.ts ----------------->');
    let _game = this.gameService.gameDTO()!;
    _game.phase = 'BATTLE';
    this.perfil().nickname === _game.player1
      ? (_game.readyPlayer1 = true)
      : (_game.readyPlayer2 = true);
    this.gameService.setGame(_game);
    this.page.set('BATTLE');

    if (!_game.online) {
      // MODO HISTORIA
      this.nextTurn();
    } else {
      // MODO ONLINE
      // TODO ONLINE
    }
  }

  async aiTurn() {
    let _game = this.gameService.gameDTO()!;

    if (_game.phase === 'END') return;
    if (_game.turn !== 'player2') return;

    let continueTurn = true;

    while (continueTurn) {
      await sleep(1500);
      if(this.gameService.gameDTO()?.phase !== 'BATTLE') return;

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
        if(this.gameService.gameDTO()?.phase !== 'BATTLE') return;
      } else {
        this.audioService.play('missSound', '/audio/missSound.mp3');
        // Pequeña pausa visible para el jugador
        await sleep(1800);
        if(this.gameService.gameDTO()?.phase !== 'BATTLE') return;
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
      if(this.gameService.gameDTO()?.phase !== 'BATTLE') return;
      // --- COMPROBAR FIN DE PARTIDA ---
      if (board1.submarines.every((sub) => sub.isDestroyed)) {
        _game = { ..._game, stage: 2, winner: 'player2', phase: 'END' };
        console.log('FIN DE PARTIDA');
        // Mostrar banner o popup de victoria de la IA
        Swal.fire({
          title: 'VICTORIA!!',
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


        this.page.set('');
        this.gameService.setGame(_game);
        return;
      }
    }

    // Cambiar turno al jugador humano
    _game = { ..._game, turn: 'player1' };
    this.gameService.setGame(_game);
    this.gameService.isMyTurn.set(true);
    this.gameService.getCurrentBoard.set(_game.boardPlayer2);
  }

  async nextTurn() {
    console.log('-----------> Entro en nextTurn');
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
      await this.nextTurn();
    }
  }
  async playerFire(pos: string) {
    // Evita disparos rápidos despues del fin en MISS
    if (this.gameService.gameDTO()!.boardPlayer2.submarines.every((sub) => sub.isDestroyed)) return;
    
    console.log('-----------> Entro en playerFire');
    console.log('Disparo en posición:', pos);
    let _game = this.gameService.gameDTO()!;
    
      if (_game.turn !== 'player1') return;
  
      let result: 'HIT' | 'MISS' = 'MISS';
      for (const sub of _game.boardPlayer2.submarines) {
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

      _game.boardPlayer2.shots.push({ position: pos, result }); 
      this.gameService.setGame(_game); 
      this.gameService.shotsInBoard2.set([..._game.boardPlayer2.shots]); 
      await sleep(1800); // da tiempo a animacion 
      if(this.gameService.gameDTO()?.phase !== 'BATTLE') return;
      if (result === 'MISS') { 
        _game.turn = 'player2'; this.gameService.setGame(_game); 
        this.gameService.isMyTurn.set(false); 
        this.gameService.getCurrentBoard.set(_game.boardPlayer1); // Llamar al loop de turnos 
        this.nextTurn(); 
      }
  
        // Comprobar fin de partida
       if (_game.boardPlayer2.submarines.every((sub) => sub.isDestroyed)) {
        console.log('FIN DE PARTIDA');
        _game = { ..._game, winner: 'player1', phase: 'END' };
        this.gameService.setGame(_game);
        
        // Mostrar banner o popup de victoria del jugador
        await Swal.fire({
          title: '¡VICTORIA!',
          html: `
          <p class="text-lg text-[#39ff14]">
          <span class="text-fluor font-bold">${
            this.gameService.gameDTO()?.player1
          }</span> ha ganado!
          </p>
          <p class="text-yellow-400 font-bold mt-2">
          ¡Has ganado <span class="text-xl">100 🪙!</span>
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
