import {
  Component,
  effect,
  inject,
  Injector,
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
  ],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css',
})
export class MainGameComponent implements OnInit {
  audioService = inject(AudioService);
  storage = inject(StorageService);
  gameService = inject(GameService);
  private _injector = inject(Injector);

  perfil = signal(this.storage.get<any>('perfil'));
  page = signal('');
 
  aiService = this._injector.get(AIService);

  
  ngOnInit() {
    // Reproduce el audio al cargar el componente
    this.audioService.play('http://localhost:8080/media/audio/menu2.mp3', true);
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
  async newGame() {
    try {
      const resp = await firstValueFrom(
        // Promise solo se es pera un valor
        this.gameService.newGame(this.perfil().nickname, false)
      );

      console.log('Respuesta:', resp);

      if (resp.codigo === 0) {
        this.gameService.setGame(resp.datos);
      }
    } catch (err) {
      console.error('Error en newGame:', err);
    }
  }
  async startBattle() {
  console.log('startBattle desde main-game.component.ts ----------------->');
  let _game = this.gameService.gameDTO()!;
  _game.phase = 'BATTLE';
  this.perfil().nickname === _game.player1
    ? (_game.readyPlayer1 = true)
    : (_game.readyPlayer2 = true);
  this.gameService.setGame(_game);
  
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
  if (_game.turn !== 'player2') return;

  let continueTurn = true;

  while (continueTurn) {
    await sleep(1500);

    // IA dispara → devuelve un board NUEVO (inmutable)
    const board1 = this.aiService.fire(_game.boardPlayer1);

    // Actualiza gameDTO y signal
    _game = { ..._game, boardPlayer1: board1 };
    this.gameService.setGame(_game);
    this.gameService.shotsInBoard1.set([...board1.shots]);

    // Espera un frame para que Angular pinte
    await new Promise(res => requestAnimationFrame(() => res(0)));

    // Último disparo
    const lastShot = board1.shots[board1.shots.length - 1];
    continueTurn = lastShot.result === 'HIT';

    // --- COMPROBAR FIN DE PARTIDA ---
    if (board1.submarines.every(sub => sub.isDestroyed)) {
      // Mostrar banner o popup de victoria de la IA
      Swal.fire({
                title: 'VICTORIA!!',
                text: `${this.gameService.gameDTO()?.player2} ha ganado! para validar tu cuenta.`,
                icon: 'success',
                confirmButtonText: 'Aceptar'
              });
      await sleep(1500);
      _game = {..._game,stage: 2, winner: 'player2', phase: 'END'}
      this.page.set('NEWGAME');
      this.gameService.setGame(_game);
      return;
    }
   

    // Pequeña pausa visible para el jugador
    await sleep(500);
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
  
  if (_game.phase !== 'BATTLE') return;

  if (_game.turn === 'player1') {
    // Solo habilitar la UI, esperar clics del jugador
    // No hacemos nada más aquí; playerFire() llamará nextTurn() cuando haga MISS
      this.page.set('BATTLE');
    return;
  }

  if (_game.turn === 'player2') {
      this.page.set('BATTLE');
    // Turno de IA
    await this.aiTurn();
    // Al finalizar, nextTurn() se llamará de nuevo para pasar el turno al player1
    await this.nextTurn();
  }
}
async playerFire(pos: string) {
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

      if (sub.isTouched.every(t => t)) {
        sub.isDestroyed = true;
      }
      break;
    }
  }

  _game.boardPlayer2.shots.push({ position: pos, result });
  this.gameService.setGame(_game);
  this.gameService.shotsInBoard2.set([..._game.boardPlayer2.shots]);
  await sleep(1500);

  if (result === 'MISS') {
    _game.turn = 'player2';
    this.gameService.setGame(_game);
    this.gameService.isMyTurn.set(false);
    this.gameService.getCurrentBoard.set(_game.boardPlayer1);
    // Llamar al loop de turnos
    this.nextTurn();
  } 
  // Comprobar fin de partida
if (_game.boardPlayer2.submarines.every(sub => sub.isDestroyed)) {
  Swal.fire({
    title: 'VICTORIA!!',
    text: `${_game.player1} ha ganado la partida!`,
    icon: 'success',
    confirmButtonText: 'Aceptar'
  });
  await sleep(1500);
  _game = {..._game, stage: 2, winner: 'player1', phase: 'END'};
  this.page.set('NEWGAME');
  this.gameService.setGame(_game);
  return; // No cambiar turno
}

  // Si fue HIT, el jugador sigue disparando; no se cambia turno
}


}
