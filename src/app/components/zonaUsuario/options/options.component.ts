import { PerfilService } from '../../../services/game/perfil.service';
import { Component, effect, inject, output, signal } from '@angular/core';
import { StorageService } from '../../../services/store/storageLocal.service';
import { HeaderComponent } from '../../zonaPortal/header/header.component';
import { FooterComponent } from '../../zonaPortal/footer/footer.component';
import { PanelStatsComponent } from '../panel-stats/panel-stats.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-options',
  imports: [HeaderComponent, FooterComponent, PanelStatsComponent],
  templateUrl: './options.component.html',
  styleUrl: './options.component.css',
})
export class OptionsComponent {
  storage = inject(StorageService);
  router = inject(Router);
  perfilService = inject(PerfilService);
  perfil = signal(this.storage.get<any>('perfil'));

  page = signal('');

  constructor() {
    effect(() => {
      const _page = this.page();
      if (_page === 'MENU') {
        this.router.navigate(['/darkblue/main-game']);
      }
    });
  }
}
