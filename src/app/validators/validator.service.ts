import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

 public basicValidation(tipo: string, value: string): string | null | undefined {
   
  if (!value && tipo !== 'rePassword') return `* El ${tipo} es obligatorio`;
  if (!value && tipo === 'rePassword') return '* La confirmación de la contraseña es obligatoria';
  let _patron:RegExp;

  switch (tipo) {
    
     case "nickname":
       if (value.length < 3) return "* El nickname debe tener al menos 3 caracteres";
       if (value.length > 10) return "El nickname no puede tener más de 10 caracteres";
       _patron=new RegExp("^[a-zA-Z0-9_-]+$");
       if (!value.match(_patron)) return "* El nickname solo puede contener letras, números y guiones bajos";
       break;
     case "email":
      _patron = new RegExp("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$", "i");

       if (!value.match(_patron)) return "* El formato del email no es válido";
       break;
  }
   return null;
 }

 public passwordValidation(value: string): string[] | null | undefined {
  const errors: string[] = [];
  if (!value) {
    errors.push('* La contraseña es obligatoria');
    return errors;
  }
  if (value.length < 8) errors.push('* Debe tener al menos 8 caracteres');
    if (!/[A-Z]/.test(value)) errors.push('* Debe contener al menos una mayúscula');
    if (!/[a-z]/.test(value)) errors.push('* Debe contener al menos una minúscula');
    if (!/\d/.test(value)) errors.push('* Debe contener al menos un número');
    if (!/[!@#$%^&*]/.test(value)) errors.push('* Debe contener al menos un carácter especial');
    return errors
 }
}
