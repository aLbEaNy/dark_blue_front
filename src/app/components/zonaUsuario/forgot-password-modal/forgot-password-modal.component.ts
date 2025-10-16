import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forgot-password-modal.component.html',
})
export class ForgotPasswordModalComponent {
  authService = inject(AuthService);
  email = '';
  close = output();
  msgError = signal('');

  closeModal() {
    this.close.emit();
  }

  async sendEmail() {
    const _resp = await this.authService.forgotPassword(this.email);
    if (_resp.codigo === 0) {
      await Swal.fire({
        text: `Hemos enviado un correo a ${this.email} con una nueva contraseña.
        Podrás cambiarla una vez hagas sesión en los ajustes de usuario.`,
        customClass: {
          popup: 'bg-principal text-red-800 rounded-2xl shadow-black shadow-lg', // fondo del modal
          confirmButton:
            'bg-btn hover:bg-yellow-600 text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
        },
        buttonsStyling: false,
        confirmButtonText: 'Aceptar',
      });
    } else {
      this.msgError.set(_resp.mensaje);
      await Swal.fire({
        text: this.msgError(),
        customClass: {
          popup: 'bg-principal text-red-800 rounded-2xl shadow-black shadow-lg', // fondo del modal
          confirmButton:
            'bg-btn hover:bg-yellow-600 text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
        },
        buttonsStyling: false,
        confirmButtonText: 'Aceptar',
      });
      this.msgError.set('');
    }

    this.closeModal();
  }
}
