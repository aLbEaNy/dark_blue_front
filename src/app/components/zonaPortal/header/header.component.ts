import { Component, inject, signal } from '@angular/core';
import { StorageService } from '../../../services/store/storage.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  private _storage = inject(StorageService);

  perfil = signal<any>(this._storage.get('perfil'));
  

  

}
