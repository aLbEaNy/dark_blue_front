import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from '../store/storageLocal.service';
import Perfil from '../../models/Perfil';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  private http = inject(HttpClient);
  storage = inject(StorageService);

  perfil = signal<Perfil>(this.storage.get('perfil')!);
  private baseUrl = window.__env.backendUrl;

  getPerfil(nickname: string) {
    return firstValueFrom(
      this.http.get<Perfil>(`${this.baseUrl}/perfil/get/${nickname}`)
    );
  }

  setPerfil(perfil: Perfil) {
    this.perfil.set(perfil);
    this.storage.set('perfil', perfil); // persistencia en local
  }

  updatePerfil(perfil: Perfil) {
    return firstValueFrom(
      this.http.post<Perfil>(`${this.baseUrl}/perfil/update`, perfil)
    );
  }
  updateProfile(formData: FormData) {
    return firstValueFrom(
      this.http.post<Perfil>(`${this.baseUrl}/perfil/profile`, formData)
    );
  }
  
  deletePerfil(nickname: string) {
    return firstValueFrom(
      this.http.delete<boolean>(`${this.baseUrl}/perfil/${nickname}`)
    );
  }
}
