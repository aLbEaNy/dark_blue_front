import { PagesService } from './../../../services/pages/pages.service';
import { PerfilService } from '../../../services/game/perfil.service';
import { Component, computed, effect, inject, output, signal } from '@angular/core';
import { StorageService } from '../../../services/store/storageLocal.service';
import { HeaderComponent } from '../../zonaPortal/header/header.component';
import { FooterComponent } from '../../zonaPortal/footer/footer.component';
import { PanelStatsComponent } from '../panel-stats/panel-stats.component';
import { Router } from '@angular/router';
import { ProfileComponent } from "../profile/profile.component";
import { ShopComponent } from "../shop/shop.component";

@Component({
  selector: 'app-options',
  imports: [HeaderComponent, FooterComponent, PanelStatsComponent, ProfileComponent, ShopComponent],
  templateUrl: './options.component.html',
  styleUrl: './options.component.css',
})
export class OptionsComponent {
  storage = inject(StorageService);
  router = inject(Router);
  perfilService = inject(PerfilService);
  perfil = signal(this.storage.get<any>('perfil'));
  pagesService= inject(PagesService);
  pagesComputed = computed(() => this.pagesService.pages());


  constructor() {
    effect(() => {
      const _pages= this.pagesComputed();
      console.log('_pages vale: ', _pages);
      if (_pages === 'MENU') {
        this.router.navigate(['/darkblue/main-game']);
      }
      
    });
  }
}
