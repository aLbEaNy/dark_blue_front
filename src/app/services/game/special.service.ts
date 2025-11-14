import { computed, Injectable, signal } from '@angular/core';
import Special from '../../models/Special';

@Injectable({
  providedIn: 'root',
})
export class SpecialService {
  specialBossSlot1 = signal<Special | null>(null);
  specialBossSlot2 = signal<Special | null>(null);
  specialPlayerSlot1 = signal<Special | null>(null);
  specialPlayerSlot2 = signal<Special | null>(null);
  counterBossSlot1 = signal(0);
  counterBossSlot2 = signal(0);
  readyBossSpecial1 = signal(false);
  readyBossSpecial2 = signal(false);

  asignSpecialBoss(stage: number) {
    let _special1: Special = {
      name: '',
      description: '',
      image: '',
      owner: '',
    };
    let _special2: Special = {
      name: '',
      description: '',
      image: '',
      owner: '',
    };
    switch (stage) {
      case 1:
        _special1.name = 'laserShot';
        _special1.description =
          'Cada 6 disparos fallidos se activa un disparo laser que elimina una fila o columna entera';
        _special1.image = '/images/special/laserShot.png';
        _special1.owner = 'PMR-69';
        _special2.name = '';
        break;
      case 2:
        _special1.name = 'x2Shot';
        _special1.description =
          'Cada 3 disparos fallidos se activa un turno doble';
        _special1.image = '/images/special/x2Shot.png';
        _special1.owner = 'ML0-L4';
        _special2.name = 'multiShot';
        _special2.description =
          'Cada 4 disparos fallidos se activa un disparo múltiple';
        _special2.image = '/images/special/multiShot.png';
        _special2.owner = 'ML0-L4';
        break;
      case 3:
        _special1.name = 'multiShot';
        _special1.description =
          'Cada 4 disparos fallidos se activa un disparo múltiple';
        _special1.image = '/images/special/multiShot.png';
        _special1.owner = 'TR6-S4';
        _special2.description =
          'Cada 6 disparos fallidos se activa un disparo laser que elimina una fila o columna entera';
        _special2.name = 'laserShot';
        _special2.image = '/images/special/laserShot.png';
        _special2.owner = 'TR6-S4';
        break;
    }
    this.specialBossSlot1.set(_special1);
    this.specialBossSlot2.set(_special2);
  }
  adminSpecialCounter(name: String, counter: number) {
    switch (name) {
      case 'x2Shot':
        if (counter === 3) {   
          return true;
        }
        break;
      case 'multiShot':
        if (counter === 4) {
          return true;
        }
        break;
      case 'laserShot':
        if (counter === 6) {
          return true;
        }
        break;
    }
    return false;
  }
}
