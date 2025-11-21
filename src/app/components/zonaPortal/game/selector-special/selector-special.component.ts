import { Component, computed, inject, output, signal } from '@angular/core';
import { PerfilService } from '../../../../services/game/perfil.service';
import { SpecialService } from '../../../../services/game/special.service';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-selector-special',
  imports: [NgClass],
  templateUrl: './selector-special.component.html',
  styleUrl: './selector-special.component.css'
})
export class SelectorSpecialComponent {
  perfilService = inject(PerfilService);
  specialService = inject(SpecialService);

  specials = signal (this.perfilService.perfil().stats.specials || []);
  inSlot1 = computed (() =>
    this.specialService.specialPlayerSlot1());
  inSlot2 = computed (() =>
    this.specialService.specialPlayerSlot2());


}
