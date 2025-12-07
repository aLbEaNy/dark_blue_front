import { PerfilService } from '../../../../services/game/perfil.service';
import { SpecialService } from '../../../../services/game/special.service';
import { GameService } from './../../../../services/game/game.service';
import { Component, computed, inject, output, signal } from '@angular/core';
import { SelectorSpecialComponent } from "../selector-special/selector-special.component";

@Component({
  selector: 'app-mini-placement',
  imports: [SelectorSpecialComponent],
  templateUrl: './mini-placement.component.html',
  styleUrl: './mini-placement.component.css'
})
export class MiniPlacementComponent {
  gameService = inject(GameService);
  pageChange = output<string>();
  pageChangeOnline = output<string>();
  perfilService = inject(PerfilService);
  specialService = inject(SpecialService);
  specials = this.perfilService.perfil().stats.specials;
  slot1 = signal(this.perfilService.perfil().stats.specialSlot1 || '');
  computedSlot1 = computed(() => this.specialService.specialPlayerSlot1());
  slot2 = signal(this.perfilService.perfil().stats.specialSlot2 || '');
  computedSlot2 = computed(() =>this.specialService.specialPlayerSlot2());
  showSelelectorSlot1 = computed(() => this.specialService.showSelector1());
  showSelelectorSlot2 = computed(() => this.specialService.showSelector2());
  
  async startBattle(event: MouseEvent, page: string) { 
    console.log('has pulsado el boton EMPEZAR')
    //OFFLINE    
    if(!this.gameService.gameDTO()?.online){
      this.pageChange.emit(page); //START
      return;
    }
    //ONLINE
    let _game = this.gameService.gameDTO()!;

    this.gameService.me() === 'player1' 
    ? _game.specialPlayer1 = {
      special1: this.computedSlot1().name!,
      special2: this.computedSlot2().name!,
      counter1: 0,
      counter2: 0,
      activeSpecial1: false,
      activeSpecial2: false
    }
    : _game.specialPlayer2 = {
      special1: this.computedSlot1().name!,
      special2: this.computedSlot2().name!,
      counter1: 0,
      counter2: 0,
      activeSpecial1: false,
      activeSpecial2: false
    }
    // Atualizo con update para obtener respuesta del webSocket

    if (this.gameService.me() === 'player1'){
      console.log('SOY EL PLAYER1--> readyPlayer1 = true');  
      _game.readyPlayer1 = true;
    }
    else{
      console.log('SOY EL PLAYER2--> readyPlayer2 = true');
      _game.readyPlayer2 = true;
    }
    const _gameUpdated = await this.gameService.updateGame(_game);
    this.gameService.setGame(_gameUpdated.datos);
    
    console.log('<---> game actualizado con updateGame: ', this.gameService.gameDTO()); 
    if(this.gameService.gameDTO()?.readyPlayer1 && this.gameService.gameDTO()?.readyPlayer2){
      const _game = this.gameService.gameDTO()!;
      _game.phase = 'BATTLE';
      await this.gameService.setGame(_game);
      return; //Salgo para evitar error al destruirse el componente (por socket cambia la vista)
    }
    this.pageChangeOnline.emit('WAITING'); 
  }

}
