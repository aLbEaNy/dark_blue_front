import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private audio: HTMLAudioElement | null = null;

  play(src: string, loop: boolean = false) {
    if (this.audio) {
      this.audio.pause(); // detener audio previo si había
    }
    this.audio = new Audio(src);
    this.audio.loop = loop;
    this.audio.play();
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0; // volver al inicio
    }
  }

  isPlaying(): boolean {
    return this.audio !== null && !this.audio.paused
  }


}
