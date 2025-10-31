import { GameService } from './../../../../services/game/game.service';
import { Component, inject, output } from '@angular/core';

@Component({
  selector: 'app-mini-placement',
  imports: [],
  templateUrl: './mini-placement.component.html',
  styleUrl: './mini-placement.component.css'
})
export class MiniPlacementComponent {
  gameService = inject(GameService);
  pageChange = output<string>();
  pageChangeOnline = output<string>();


  async startBattle(event: MouseEvent, page: string) { 
    console.log('has pulsado el boton EMPEZAR')
    //OFFLINE    
    if(!this.gameService.gameDTO()?.online){
      this.pageChange.emit(page); //START
      return;

    }

    //ONLINE
    let _game = this.gameService.gameDTO()!;

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
