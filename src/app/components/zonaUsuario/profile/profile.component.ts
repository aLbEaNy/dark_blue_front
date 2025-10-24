import { PagesService } from './../../../services/pages/pages.service';
import { StorageService } from './../../../services/store/storageLocal.service';
import { AuthService } from './../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { PerfilService } from './../../../services/game/perfil.service';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ValidatorService } from '../../../validators/validator.service';
import { NgClass } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  imports: [NgClass],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  perfilService = inject(PerfilService);
  authService = inject(AuthService);
  validator = inject(ValidatorService);
  storageService = inject(StorageService);
  pagesService = inject(PagesService);
  router = inject(Router);
  perfil = this.perfilService.perfil;
  avatar = signal(this.perfil().avatar);
  nickname = signal(this.perfil().nickname);
  nicknameExist = computed(async () => {
    const _nickname = await this.authService.nicknameExists(this.nickname());
    return _nickname.codigo === 0;
  });

  editingNickname = signal(false);
  editingPassword = signal(false);
  msgErrorNickname = signal('');
  password = signal('**********');
  msgErrorPassword = signal('');
  avatarRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  inputNicknameRef = viewChild<ElementRef<HTMLInputElement>>('nicknameInput');
  inputPasswordRef = viewChild<ElementRef<HTMLInputElement>>('passwordInput');

  // Dentro de tu ProfileComponent
  private MAX_SIZE_PX = 200; // tamaño máximo del lado del cuadrado (ajusta si quieres 256, 1024, etc.)
  private OUTPUT_JPEG_QUALITY = 0.85; // calidad para jpg (0..1)

  // helper: convierte canvas.toBlob a Promise
  private canvasToBlob(
    canvas: HTMLCanvasElement,
    mime: string,
    quality?: number
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), mime, quality);
    });
  }

  /**
   * Recorta la imagen al centro en forma cuadrada y la redimensiona a `maxSide` si hace falta.
   * Devuelve un File listo para subir y también un dataURL para previsualizar.
   */
  private async processImageFileToSquare(
    file: File,
    maxSide = this.MAX_SIZE_PX
  ): Promise<{ file: File; dataUrl: string }> {
    // leer file como DataURL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

    // crear Image y esperar a cargar
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
      image.src = dataUrl;
      // importante para evitar problemas CORS si trabajas con URLs externas
      image.crossOrigin = 'anonymous';
    });

    // dimensiones originales
    const ow = img.naturalWidth;
    const oh = img.naturalHeight;

    // calcular lado del cuadrado (recortar al centro)
    const side = Math.min(ow, oh);
    const sx = Math.floor((ow - side) / 2);
    const sy = Math.floor((oh - side) / 2);

    // tamaño final del canvas (si side > maxSide, escalamos a maxSide)
    const finalSide = side > maxSide ? maxSide : side;

    // crear canvas y dibujar
    const canvas = document.createElement('canvas');
    canvas.width = finalSide;
    canvas.height = finalSide;
    const ctx = canvas.getContext('2d')!;
    // dibujar la porción recortada, escalada al tamaño final
    ctx.drawImage(img, sx, sy, side, side, 0, 0, finalSide, finalSide);

    // decidir mime/output: preferencia por jpeg para reducir tamaño salvo que quieras mantener alpha
    // si el input era PNG y probablemente con alpha, mantenemos png; si no, usamos jpeg para mejor compresión
    let outputMime = 'image/jpeg';
    if (file.type === 'image/png') {
      // si prefieres siempre jpeg para ahorrar tamaño comenta esta línea
      outputMime = 'image/png';
    }

    // obtener blob final
    const blob = await this.canvasToBlob(
      canvas,
      outputMime,
      this.OUTPUT_JPEG_QUALITY
    );
    if (!blob) throw new Error('No se pudo generar la imagen procesada.');

    // construir nuevo File (nombre adaptado)
    const ext = outputMime === 'image/png' ? 'png' : 'jpg';
    const newName = file.name.replace(/\.[^/.]+$/, '') + `-avatar.${ext}`;
    const processedFile = new File([blob], newName, { type: outputMime });

    // obtener dataURL para previsualizar (alternativamente reader.readAsDataURL(blob))
    const previewDataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = (e) => reject(e);
      r.readAsDataURL(blob);
    });

    return { file: processedFile, dataUrl: previewDataUrl };
  }

  private selectedFile: File | null = null;

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    console.log('Archivo seleccionado:', file.name, file.type, file.size);

    try {
      // procesar: recortar cuadrado y redimensionar
      const { file: processedFile, dataUrl } =
        await this.processImageFileToSquare(file, this.MAX_SIZE_PX);

      // asignar el archivo procesado para subir al backend
      this.selectedFile = processedFile;

      // actualizar la previsualización
      this.avatar.set(dataUrl);

      console.log(
        'Procesado -> nuevo archivo:',
        processedFile.name,
        processedFile.type,
        processedFile.size
      );
    } catch (err) {
      console.error('Error procesando imagen:', err);
      alert('No se pudo procesar la imagen. Intenta con otro archivo.');
    }
  }

  constructor() {
    effect(() => {
      const _editingNickname = this.editingNickname();
      if (_editingNickname) {
        this.inputNicknameRef()?.nativeElement.focus();
        this.inputNicknameRef()?.nativeElement.select();
      }
    });
    effect(() => {
      const _editingPassword = this.editingPassword();
      if (_editingPassword) {
        this.inputPasswordRef()?.nativeElement.focus();
        this.inputPasswordRef()?.nativeElement.select();
      }
    });
    effect(async () => {
      const _nickname = this.nickname();
      const _nicknameValidator = this.validator.basicValidation(
        'nickname',
        _nickname
      );
      if (_nicknameValidator) {
        this.msgErrorNickname.set(_nicknameValidator);
        return;
      }
      if (
        (await this.nicknameExist()) &&
        this.nickname() !== this.perfil().nickname
      ) {
        this.msgErrorNickname.set('* El nickname ya existe');
        return;
      }
      this.msgErrorNickname.set('');
    });
    effect(() => {
      const _password = this.password();
      const _passwordValidator = this.validator.passwordValidation(_password);
      if (_passwordValidator && _password !== '**********') {
        this.msgErrorPassword.set(_passwordValidator.join('\n'));
        return;
      }
      this.msgErrorPassword.set('');
    });
  }

  editAvatar() {
    // 👇 Se obtiene el elemento DOM real así:
    const input = this.avatarRef()?.nativeElement;
    if (input) {
      input.click();
    } else {
      console.warn('No se encontró el input de archivo');
    }
  }
  editNickname() {
    this.editingNickname.set(true);
  }
  editPassword() {
    this.editingPassword.set(true);
  }
  async deleteAccount() {
  await Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás revertir esto!',
    icon: 'warning',
    showCancelButton: true,
    customClass: {
      popup: 'bg-principal text-yellow-400 rounded-2xl shadow-black shadow-lg border border-gray-700',
      icon: 'text-yellow-500',
      title: 'text-red-600 font-extrabold tracking-wider',
      htmlContainer: 'text-gray-300',
      confirmButton: 'bg-btn hover:bg-yellow-600 text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
      cancelButton: 'bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
    },
    buttonsStyling: false,
    confirmButtonText: 'Sí, eliminarla!',
    cancelButtonText: 'Cancelar',
  }).then(async (result) => {
    if (result.isConfirmed) {
      const deleteAccount = await this.authService.deleteAccount(
        this.perfil().username
      );
      if (deleteAccount) {
        this.authService.logout();
        this.storageService.clear();
        this.router.navigate(['/login']);

        await Swal.fire({
          title: 'Eliminada!',
          text: 'Tu cuenta ha sido eliminada.',
          icon: 'success',
          customClass: {
            popup: 'bg-principal text-green-400 rounded-2xl shadow-black shadow-lg border border-gray-700',
            title: 'text-green-400 font-extrabold tracking-wider',
            confirmButton:
              'bg-btn hover:bg-green-600 text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
          },
          buttonsStyling: false,
          confirmButtonText: 'Aceptar',
        });
      } else {
        await Swal.fire({
          title: 'Error!',
          text: 'No se pudo eliminar la cuenta.',
          icon: 'error',
          customClass: {
            popup: 'bg-principal text-red-400 rounded-2xl shadow-black shadow-lg border border-gray-700',
            title: 'text-red-500 font-extrabold tracking-wider',
            confirmButton:
              'bg-btn hover:bg-red-600 text-darkBlue font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
          },
          buttonsStyling: false,
          confirmButtonText: 'Aceptar',
        });
      }
    }
  });
}

  async saveChanges() {
    const formData = new FormData();
    formData.append('username', this.perfil().username);
    formData.append('nickname', this.nickname());
    if (this.password() !== '**********') {
      formData.append('password', this.password());
    }
    // Avatar editable (solo si se seleccionó un archivo)
    if (this.selectedFile) {
      formData.append(
        'avatar',
        this.selectedFile,
        `${this.perfil().username}.png`
      );
    }

    // Enviar al backend
    const newPerfil = await this.perfilService.updateProfile(formData);
    this.perfilService.setPerfil(newPerfil);
    this.pagesService.pages.set('OPTIONS');
  }
}
