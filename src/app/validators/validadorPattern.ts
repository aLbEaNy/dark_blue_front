//PATTERNS PARA VALIDAR CAMPOS DE FORMULARIO:


import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function patternValidator(tipo:string): ValidatorFn {
    let _patron:RegExp;
    switch (tipo) {
        case 'email':
            _patron=new RegExp("^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$");
            break;
        case 'nickname':
            _patron=new RegExp("^[a-zA-Z0-9_-]+$");
            break;
        default:
            break;
    }

    return (control:AbstractControl): ValidationErrors | null => {

        if (! _patron.test(control.value || '')) {
            return { 'pattern': true } //error no cumple el patron 
        }
        return null;   
    }

}
export function uppercaseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid = /[A-Z]/.test(control.value || '');
    return valid ? null : { uppercase: '* Debe contener al menos una mayúscula' };
  };
}

export function lowercaseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid = /[a-z]/.test(control.value || '');
    return valid ? null : { lowercase: '* Debe contener al menos una minúscula' };
  };
}

export function numberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid = /\d/.test(control.value || '');
    return valid ? null : { number: '* Debe contener al menos un número' };
  };
}

export function specialCharValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid = /[!@#$%^&*()=,.?":{}|<>]/.test(control.value || '');
    return valid ? null : { specialChar: '* Debe contener un carácter especial' };
  };
}
