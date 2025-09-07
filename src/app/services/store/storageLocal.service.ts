import { Injectable, signal } from '@angular/core';
import IActivationData from '../../models/IActivationData';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  activationData= signal< IActivationData | null > (null);
  
  /**
   * Guarda un valor en localStorage (objeto o string)
   * @param key - Clave en el localStorage
   * @param value - Datos a guardar
   */
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
    switch (key) {
      case 'activationData':
        this.activationData.set(value as IActivationData);
        break;
    }
  }

  /**
   * Recupera un valor del localStorage y lo parsea
   * @param key - Clave en el localStorage
   * @returns El valor guardado o null si no existe o es inválido
   */
  get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      return JSON.parse(itemStr) as T;
    } catch {
      return null;
    }
  }

  /**
   * Elimina un elemento del localStorage
   * @param key - Clave a eliminar
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Limpia todo el localStorage
   */
  clear(): void {
    localStorage.clear();
  }
}
