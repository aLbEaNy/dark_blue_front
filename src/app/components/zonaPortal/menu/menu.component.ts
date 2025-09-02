import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { Router } from '@angular/router';
import { AudioService } from '../../../services/audio/audio.service';

@Component({
  selector: 'app-menu',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  router = inject(Router);
  audioService = inject(AudioService);

  hoverSound = new Audio('/audio/hoverTorpedo.mp3');
  torpedoSound = new Audio('/audio/torpedo.mp3');
  
  public disableHover = signal(false);
  
  
  
  ngOnInit() {
    // Reproduce el audio al cargar el componente
    this.audioService.play('http://localhost:8080/media/audio/menu2.mp3', true); 
  }

  reproducirHover() {
    this.hoverSound.currentTime = 0; // reinicia el sonido si ya está sonando
    this.hoverSound.play();
    this.hoverSound.loop = true;

  }
  stopHover() {
    this.hoverSound.pause();
  }


dispararTorpedo(event: MouseEvent, ruta: string) {
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
      
      this.router.navigate(['/home']);
    }, 1200);
  }
}
