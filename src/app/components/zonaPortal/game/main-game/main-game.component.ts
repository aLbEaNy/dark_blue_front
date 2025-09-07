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
import { MiniDisplayUserComponent } from "../mini-display-user/mini-display-user.component";
import { MiniPlacementComponent } from "../mini-placement/mini-placement.component";

@Component({
  selector: 'app-main-game',
  imports: [MenuComponent, BoardComponent, HeaderComponent, FooterComponent, MiniDisplayUserComponent, MiniPlacementComponent],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css',
})
export class MainGameComponent implements OnInit {
  audioService = inject(AudioService);
  storage = inject(StorageService);
  gameService = inject(GameService);
  private _injector = inject(Injector);

  perfil = signal(this.storage.get<any>('perfil'));
  nickname = signal<string>(this.perfil().nickname);
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
      if (_page === 'newGame') {
        this.newGame();
      }
    });
  }
  async newGame() {
  try {
    const resp = await firstValueFrom( // Promise solo se es pera un valor
      this.gameService.newGame(this.nickname(), false)
    );

    console.log("Respuesta:", resp);

    if (resp.codigo === 0) {
      this.gameService.gameDTO.set(resp.datos);
      this.storage.set("gameDTO", resp.datos);
    }
  } catch (err) {
    console.error("Error en newGame:", err);
  }
}
}
