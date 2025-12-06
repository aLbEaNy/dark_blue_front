import { GameService } from './game.service';
import { computed, inject, Injectable, signal } from '@angular/core';
import Special from '../../models/Special';
import { PerfilService } from './perfil.service';

@Injectable({
  providedIn: 'root',
})
export class SpecialService {
  perfilService = inject(PerfilService);
  gameService = inject(GameService);
  specialBossSlot1 = signal<Special | null>(null);
  specialBossSlot2 = signal<Special | null>(null);

  specialPlayerSlot1 = signal<Special>(
    this.getSpecial(this.perfilService.perfil().stats.specialSlot1!, this.perfilService.perfil().nickname));
  specialPlayerSlot2 = signal<Special>(
    this.getSpecial(this.perfilService.perfil().stats.specialSlot2!, this.perfilService.perfil().nickname));

  counterBossSlot1 = signal(0);
  counterBossSlot2 = signal(0);
  counterPlayerSlot1 = signal(0);
  counterPlayerSlot2 = signal(0);
  counterPlayerRivalSlot1 = signal(0);
  counterPlayerRivalSlot2 = signal(0);
  readyBossSpecial1 = signal(false);
  readyBossSpecial2 = signal(false);
  readyPlayerSpecial1 = signal(false);
  readyPlayerSpecial2 = signal(false);
  readyPlayerRivalSpecial1 = signal(false);
  readyPlayerRivalSpecial2 = signal(false);
  showSelector1 = signal(false);
  showSelector2 = signal(false);  
  activateSpecialFlag = signal(false);


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
          'Cada 6 disparos fallidos se activa un disparo láser aleatorio que elimina una fila o columna entera';
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
          'Cada 4 disparos fallidos se activa un disparo múltiple inteligente';
        _special2.image = '/images/special/multiShot.png';
        _special2.owner = 'ML0-L4';
        break;
      case 3:
        _special1.name = 'multiShot';
        _special1.description =
          'Cada 4 disparos fallidos se activa un disparo múltiple inteligente';
        _special1.image = '/images/special/multiShot.png';
        _special1.owner = 'TR6-S4';
        _special2.description =
          'Cada 6 disparos fallidos se activa un disparo láser aleatorio que elimina una fila o columna entera';
        _special2.name = 'laserShot';
        _special2.image = '/images/special/laserShot.png';
        _special2.owner = 'TR6-S4';
        break;
    }
    this.specialBossSlot1.set(_special1);
    this.specialBossSlot2.set(_special2);
  }
  adminSpecialCounter(name: string, counter: number) {
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

  specialPlayerRivalSlot1(){
    const slot1Rival = this.gameService.me() === 'player1' 
    ? this.gameService.gameDTO()?.specialPlayer2?.special1
    : this.gameService.gameDTO()?.specialPlayer1?.special1;
    return this.getSpecial(slot1Rival!, this.nicknameRival())
  };
  specialPlayerRivalSlot2() {
    const slot2Rival = this.gameService.me() === 'player1' 
    ? this.gameService.gameDTO()?.specialPlayer2?.special2
    : this.gameService.gameDTO()?.specialPlayer1?.special2;
    return this.getSpecial(slot2Rival!, this.nicknameRival())
  };
  nicknameRival(){
    return this.gameService.me() === 'player1' 
    ? this.gameService.gameDTO()?.player2!
    : this.gameService.gameDTO()?.player1!;
  }
  getSpecial(nameSpecial: string, nickname: string):Special {
    let _special: Special = {
      name: '',
      description: '',
      image: '',
      owner: '',
    }
    switch (nameSpecial) {
      case 'x2Shot':
        _special.name = 'x2Shot';
        _special.description = 'Cada 3 disparos fallidos se activa un turno doble';
        _special.image = '/images/special/x2Shot.png';
        _special.owner = nickname;
        break;
      case 'multiShot':
        _special.name = 'multiShot';
        _special.description = 'Cada 4 disparos fallidos se activa un disparo múltiple inteligente.';
        _special.image = '/images/special/multiShot.png';
        _special.owner = nickname;
        break;
        case 'laserShot':
          _special.name = 'laserShot';
          _special.description = 'Cada 6 disparos fallidos se activa un disparo láser aleatorio que elimina una fila o columna entera';
          _special.image = '/images/special/laserShot.png';
          _special.owner = nickname;
          break;
          default:
          break;    
    }
    return _special;
   
  }
  selectorChangeSlot(nameSpecial: string){
    console.log('En specialService: ',nameSpecial, this.showSelector1(), this.showSelector2());
    const _special = this.getSpecial(nameSpecial, this.perfilService.perfil().nickname);
    let _perfil = this.perfilService.perfil();
    if(this.showSelector1()){
      this.specialPlayerSlot1.set(_special);
      _perfil.stats.specialSlot1 = nameSpecial;
      this.showSelector1.set(false);
    }
    if(this.showSelector2()){
      this.specialPlayerSlot2.set(_special);
      _perfil.stats.specialSlot2 = nameSpecial;
      this.showSelector2.set(false);
    } 
    this.perfilService.setPerfil(_perfil);
    this.perfilService.updatePerfil(_perfil);
  }
}
