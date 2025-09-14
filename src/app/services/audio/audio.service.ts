import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audios: Map<string, HTMLAudioElement> = new Map();

  play(id: string, src: string, loop: boolean = false, volume: number = 1) {
    if (this.audios.has(id)) {
      this.stop(id);
    }
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume; // volumen inicial
    audio.play();
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
}
