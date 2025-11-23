import { Component, computed, inject } from '@angular/core';
import { PerfilService } from '../../../services/game/perfil.service';
import { DatePipe } from '@angular/common';
import { PagesService } from '../../../services/pages/pages.service';

@Component({
  selector: 'app-panel-stats',
  imports: [DatePipe],
  templateUrl: './panel-stats.component.html',
  styleUrl: './panel-stats.component.css'
})
export class PanelStatsComponent {
   perfilService = inject(PerfilService);
   pagesService = inject(PagesService);
   perfil = this.perfilService.perfil();
   gamesPlayed = computed(() => {
    return (this.perfil.stats.wins as number) + (this.perfil.stats.losses as number);
   });
   timeGamePlayed = computed(() => {
        const time = this.perfilService.perfil().stats.playTime || 0;
        const hours = Math.floor(time / 3600000) || 0;
        const minutes = Math.floor((time % 3600000) / 60000) || 0;
        const seconds = Math.floor((time % 60000) / 1000) || 0;
        return `${hours}h ${minutes}m ${seconds}s`;
   });





}
