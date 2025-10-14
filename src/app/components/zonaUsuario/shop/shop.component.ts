import { Component, inject, signal } from '@angular/core';
import { PerfilService } from '../../../services/game/perfil.service';

@Component({
  selector: 'app-shop',
  imports: [],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent {
  perfilService = inject(PerfilService);
   perfil = this.perfilService.perfil;

   tienda = signal([]);

   comprar(){

   }

}
