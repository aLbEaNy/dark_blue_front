import { Component, inject, signal, computed } from '@angular/core';
import { PerfilService } from '../../../services/game/perfil.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent{
  perfilService = inject(PerfilService);
  perfil = computed (() => this.perfilService.perfil());

}


