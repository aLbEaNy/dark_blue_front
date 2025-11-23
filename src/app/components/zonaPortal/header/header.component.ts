import { Component, inject, computed, output, input } from '@angular/core';
import { PerfilService } from '../../../services/game/perfil.service';
import { Router } from '@angular/router';
import { PagesService } from '../../../services/pages/pages.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent{
  perfilService = inject(PerfilService);
  pageService = inject(PagesService);
  router = inject(Router);
  perfil = computed (() => this.perfilService.perfil());

  pages = this.pageService.pages

  page = input()
  

}


