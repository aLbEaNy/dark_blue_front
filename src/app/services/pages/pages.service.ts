import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagesService {

  pages = signal<string>('MENU')

}
