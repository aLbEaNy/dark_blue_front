import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '../../../../services/audio/audio.service';
import { NgClass } from '@angular/common';
import { GameService } from '../../../../services/game/game.service';

@Component({
  selector: 'app-menu',
  imports: [NgClass],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  router = inject(Router);
  audioService = inject(AudioService);
  gameService = inject(GameService);

  pageChange = output<string>();

  // señal que guarda qué botón está activo
  activePage = signal<string | null>(null);

  reproducirHover() {
    if (!this.activePage()) {
      this.audioService.play('hoverSound','/audio/hoverTorpedo.mp3',true);
    }
  }

  stopHover() {
    this.audioService.stop('hoverSound');
  }

  dispararTorpedo(page: string) {
    if (this.activePage()) return; // evita doble click mientras hay animación
    this.activePage.set(page);
    // Sonido torpedo
    this.audioService.stop('hoverSound');
    this.audioService.play('torpedoSound','/audio/torpedoSound.mp3');

    if(page === 'NEWGAME'){
      let _game = this.gameService.gameDTO()!;
      _game.gameId ='';
      _game.online = false;
      this.gameService.setGame(_game);
    }
    // Cambiar de vista después de 1.2s
    setTimeout(() => {
        this.pageChange.emit(page); 
      }, 1200);
  }
}
