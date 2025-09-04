import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
 pageChange = output<string>();

  router = inject(Router);

  hoverSound = new Audio('/audio/hoverTorpedo.mp3');
  torpedoSound = new Audio('/audio/torpedo.mp3');
  
  public disableHover = signal(false);

  reproducirHover() {
    this.hoverSound.currentTime = 0; // reinicia el sonido si ya está sonando
    this.hoverSound.play();
    this.hoverSound.loop = true;

  }
  stopHover() {
    this.hoverSound.pause();
  }


dispararTorpedo(event: MouseEvent, page: string) {
    const button = event.currentTarget as HTMLElement;

    // Agregar la clase que activa la animación
    button.classList.add('torpedo-active');

    // Deshabilitar hover mientras se anima
    button.classList.remove('btn-vibrate');

    this.disableHover.set(true);

    // Sonido torpedo
    this.hoverSound.pause();
    this.torpedoSound.currentTime = 0.4;
    this.torpedoSound.play();

    // Cambiar de vista después de 1 segundo
    setTimeout(() => {
      this.pageChange.emit(page);
    }, 1200);
  }
}
