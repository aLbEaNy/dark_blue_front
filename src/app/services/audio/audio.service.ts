import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audios: Map<string, HTMLAudioElement> = new Map();

  play(id: string, src: string, loop: boolean = false, volume: number = 1) {
  if (this.audios.has(id)) {
    this.stop(id);
  }
  const audio = new Audio(src+'?t='+Math.random());//evitar cache del navegador
  audio.loop = loop;
  audio.volume = volume;

  // Evitar que se propague el AbortError
  audio.play().catch((err) => {
    if (err.name !== 'AbortError') {
      console.warn('AudioService play error:', err);
    }
  });

  this.audios.set(id, audio);
}


  pause(id: string) {
    const audio = this.audios.get(id);
    if (audio) audio.pause();
  }

  stop(id: string) {
    const audio = this.audios.get(id);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      this.audios.delete(id);
    }
  }

  isPlaying(id: string): boolean {
    const audio = this.audios.get(id);
    return audio !== undefined && !audio.paused;
  }

  stopAll() {
    this.audios.forEach(a => {
      a.pause();
      a.currentTime = 0;
    });
    this.audios.clear();
  }

  setVolume(id: string, volume: number) {
    const audio = this.audios.get(id);
    if (audio) {
      audio.volume = Math.min(1, Math.max(0, volume)); // clamp 0..1
    }
  }

  setVolumeAll(volume: number) {
    this.audios.forEach(a => {
      a.volume = Math.min(1, Math.max(0, volume));
    });
  }

  randomMusic(){
    const music = ['theme_boss1', 'theme_boss2', 'theme_boss3', 'war_of_victory', 'you_dont_get_it']
    const random = Math.floor(Math.random() * music.length);
    return music[random];
  }


}
