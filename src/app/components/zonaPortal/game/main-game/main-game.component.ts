import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  OnInit,
  resource,
  ResourceRef,
  signal,
  untracked,
} from '@angular/core';
import { BoardComponent } from '../board/board.component';
import { MenuComponent } from '../menu/menu.component';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import { AudioService } from '../../../../services/audio/audio.service';
import { GamePhase } from '../../../../models/GamePhase';
import IGameDTO from '../../../../models/IGAmeDTO';
import { StorageService } from '../../../../services/store/storage.service';
import { GameService } from '../../../../services/game/game.service';
import IRestMessage from '../../../../models/IRestMessage';

@Component({
  selector: 'app-main-game',
  imports: [MenuComponent, BoardComponent, HeaderComponent, FooterComponent],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css',
})
export class MainGameComponent implements OnInit {
  audioService = inject(AudioService);
  storage = inject(StorageService);
  gameService = inject(GameService);
  private _injector = inject(Injector);

  nickname = signal(this.storage.get<string>('nickname') || '');

  page = signal('main-game');

  gameDTO = signal<IGameDTO | null>(this.storage.get<IGameDTO>('gameDTO'));

  phase = signal<GamePhase>('PLACEMENT');

  isReady = signal(false);

  ngOnInit() {
    // Reproduce el audio al cargar el componente
    this.audioService.play('http://localhost:8080/media/audio/menu2.mp3', true);
  }
  constructor() {

    effect(() => {
      const data = this.newGameResource.value();

      if (data) {
        untracked(() => {
                console.log(' gameDTO desde storage vale: -----------------------> ', this.gameDTO());

          this.gameDTO.set(data.datos);
          this.phase.set(data.datos.phase);

          console.log(' gameDTO vale: -----------------------> ', data.datos);
          // Guardo en local
          this.storage.set('gameDTO', data.datos);
        });
      }
    });
  }

  // Crear nueva partida
  public newGameResource: ResourceRef<IRestMessage> = resource({
    request: () => ({
      nickname: this.nickname(),
      online: this.page() === 'online' ? true : false,
    }),
    loader: async ({ request, abortSignal }) => {
      try {
        const response = await fetch(
          `http://localhost:8080/game/new?nickname=${request.nickname}&online=${request.online}`,
          { method: 'GET', signal: abortSignal }
        );
        if (!response.ok) throw new Error('Error de red o servidor');
        const body = await response.json();
        console.log(body);

        return body ?? { codigo: 2, mensaje: ' sin datos...' };
      } catch (error) {
        console.error('Error al crear nueva partida: ', error);
        return { codigo: 1, mensaje: 'Error al crear nueva partida' };
      }
    },
    injector: this._injector,
  });
}
