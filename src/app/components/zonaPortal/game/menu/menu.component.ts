import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '../../../../services/audio/audio.service';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
 pageChange = output<string>();

  router = inject(Router);
  audioService = inject(AudioService);


  hoverSound = new Audio('/audio/hoverTorpedo.mp3');
  torpedoSound = new Audio('/audio/torpedo.mp3');
  
  public disableHover = signal(false);

  reproducirHover() {
    this.audioService.play('hoverSound','/audio/hoverTorpedo.mp3',true);
  }
  stopHover() {
    this.audioService.stop('hoverSound');
  }


dispararTorpedo(event: MouseEvent, page: string) {
    const button = event.currentTarget as HTMLElement;

    // Agregar la clase que activa la animación
    button.classList.add('torpedo-active');

    // Deshabilitar hover mientras se anima
    button.classList.remove('btn-vibrate');

    this.disableHover.set(true);

    // Sonido torpedo
    this.audioService.stop('hoverSound');
    this.torpedoSound.currentTime = 0.4;
    this.torpedoSound.play();
    this.audioService.stop('menu2');
    // Cambiar de vista después de 1 segundo
    setTimeout(() => {
      this.pageChange.emit(page);
    }, 1200);
  }
}
