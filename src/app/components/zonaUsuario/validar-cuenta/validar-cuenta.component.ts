import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-validar-cuenta',
  imports: [],
  templateUrl: './validar-cuenta.component.html',
  styleUrl: './validar-cuenta.component.css'
})
export class ValidarCuentaComponent {
  @ViewChildren('codigo0, codigo1, codigo2, codigo3, codigo4, codigo5') inputs!: QueryList<ElementRef>;

moverAlSiguiente(event: any, index: number): void {
  const input = event.target;
  const value = input.value;

  if (value && index < 5) {
    this.inputs.toArray()[index + 1].nativeElement.focus();
  } else if (!value && index > 0) {
    this.inputs.toArray()[index - 1].nativeElement.focus();
  }
}

verificarCodigo(): void {
  const codigo = this.inputs.toArray().map(input => input.nativeElement.value).join('');
  console.log('Código ingresado:', codigo);
  // Aquí llamas al backend para validar el código
}


}
