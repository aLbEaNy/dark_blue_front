import {
  Component,
  effect,
  inject,
  Injector,
  OnInit,
  signal,
} from '@angular/core';
import { BoardComponent } from '../board/board.component';
import { MenuComponent } from '../menu/menu.component';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import { AudioService } from '../../../../services/audio/audio.service';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { GameService } from '../../../../services/game/game.service';
import IRestMessage from '../../../../models/IRestMessage';
import { firstValueFrom } from 'rxjs';
import { MiniDisplayUserComponent } from '../mini-display-user/mini-display-user.component';
import { MiniPlacementComponent } from '../mini-placement/mini-placement.component';
import { MiniBoardComponent } from '../mini-board/mini-board.component';
import { BoardAtackComponent } from '../board-atack/board-atack.component';

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
  gameResponse = signal<IRestMessage | null>(null);

  isReady = signal(false);

  ngOnInit() {
    // Reproduce el audio al cargar el componente
    this.audioService.play('http://localhost:8080/media/audio/menu2.mp3', true);
  }
  constructor() {
    //Según el valor de page dispara la nueva partida
    effect(() => {
      const _page = this.page();
      console.log('page vale: ', _page);

      if (_page === 'NEWGAME') {
        this.newGame();
      }
      if (_page === 'BATTLE') {
        this.startBattle();
      }
      if (_page === 'OPTIONS') {
      }
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
    this.perfil().nickname === _game.player1
      ? (_game.readyPlayer1 = true)
      : (_game.readyPlayer2 = true);

    if (!_game.online) {
      //MODO HISTORIA
      _game.phase = 'BATTLE';
      console.log('nickname-------------------> ',_game.player1);
      

    } else {
      //MODO ONLINE
      //TODO ONLINE
    }
   
  }
}
