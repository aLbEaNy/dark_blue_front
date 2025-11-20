import { AuthService } from './../auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import Item from '../../models/Item';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private http = inject(HttpClient);
  private _injector = inject(Injector);
  private authService = inject(AuthService);

  private router = inject(Router);

  private baseUrl = window.__env.backendUrl;

  async getItems(): Promise<Item[]> {
    return firstValueFrom(this.http.get<Item[]>(`${this.baseUrl}/shop/getItems`));
  }
  async buyItem(itemId: string): Promise<Item> {
  const token = this.authService.getToken();
  console.log("TOKEN:--------->>", token);

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return await firstValueFrom(
    this.http.get<Item>(`${this.baseUrl}/shop/buyItem/${itemId}`, {
      headers
    })
  );
}
}
