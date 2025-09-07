import { StorageService } from '../../../../services/store/storageLocal.service';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-mini-display-user',
  imports: [],
  templateUrl: './mini-display-user.component.html',
  styleUrl: './mini-display-user.component.css'
})
export class MiniDisplayUserComponent {
  storageService = new StorageService();
  perfil = signal(this.storageService.get<any>('perfil'));

}
