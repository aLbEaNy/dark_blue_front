import { Component, inject, signal, OnInit } from '@angular/core';
import { PerfilService } from '../../../services/game/perfil.service';
import { ShopService } from '../../../services/shop/shop.service';
import Item from '../../../models/Item';
import Swal from 'sweetalert2';
import { NgClass } from '@angular/common';
import { PagesService } from '../../../services/pages/pages.service';


@Component({
  selector: 'app-shop',
  imports: [NgClass],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css',
})
export class ShopComponent implements OnInit {
  perfilService = inject(PerfilService);
  pagesService = inject(PagesService);
  shopService = inject(ShopService);
  perfil = this.perfilService.perfil;
  items = signal<Item[]>([]);

  async ngOnInit() {
    const _items = await this.shopService.getItems();
    if (_items) this.items.set(_items);
    console.log(this.items());
  }
  async buy(item: Item) {
    console.log('comprando--------->', item);
    let buyContinue = false;
    const currency = item.typeCoin === 'coin' ? '🪙' : '€';
    const result =await Swal.fire({
      title: 'Vas a comprar...',
      html: `
              <p class="text-lg text-[#39ff14]">
              <p class="text-fluor text-3xl font-bold font-mono">${item.name}</p><br><p class="text-acero text-xl font-bold font-mono">${item.description}</p>
              </p>
              <p class="text-yellow-400 font-bold mt-2">
              Se te descontarán <span class="text-xl">${item.price} ${currency} de tu cuenta</span>
              </p>
              `,
      imageUrl: `${item.image}`,
      imageWidth: 140,
      imageHeight: 140,
      imageAlt: 'item image',
      customClass: {
        popup: 'bg-principal text-fluor rounded-2xl shadow-black shadow-lg',
        image: 'rounded-full shadow-black shadow-lg border-4 border-yellow-500',
        confirmButton:
          'me-2 bg-green-600 hover:bg-green-700 cursor-pointer text-white font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
        cancelButton:
          'ms-2 bg-red-600 hover:bg-red-700 cursor-pointer text-white font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
        title: 'swal-title-green',
      },
      buttonsStyling: false,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
    });
    if (!result.isConfirmed) {
    console.log('Compra cancelada');
    return;
  }
    switch (item.typeCoin) {
      case 'coin':
        if (Number(this.perfil().stats.coins) < item.price) {
          Swal.fire({
            title: 'Saldo insuficiente',
            html: `
              <p class="text-lg text-[#b20000]">
              <p class="text-fluor text-3xl font-bold font-mono">${
                item.name
              }</p><br><p class="text-yellow-400 text-xl font-bold font-mono">${
              item.price
            } ${currency}
              </p>
             </p>
              </p>
              <p class="text-red-700 font-bold mt-2">
              Tienes <span class="text-xl">${
                this.perfil().stats.coins
              } 🪙</span>
              </p>
              `,
            customClass: {
              popup:
                'bg-principal text-fluor rounded-2xl shadow-black shadow-lg',
              image:
                'rounded-full shadow-black shadow-lg border-4 border-yellow-500',
              confirmButton:
                'me-2 bg-green-600 hover:bg-green-700 cursor-pointer text-white font-bold px-6 py-2 rounded-lg shadow-black shadow-lg',
              title: 'swal-title-green',
            },
            buttonsStyling: false,
            confirmButtonText: 'Aceptar',
            showCancelButton: false,
          });
        } else {
          buyContinue = true;
        }
        break;
      case 'euro':
        break;
    }
    if (buyContinue) {
      const _resp = await this.shopService.buyItem(item.id!);
      if (_resp) {
        console.log('ITEM desde backend---> ',_resp);
        //actualizar perfil
         const _perfil =await this.perfilService.getPerfil(this.perfil().nickname);
         if(_perfil){
          this.perfilService.setPerfil(_perfil);
          console.log('perfil actualizado--->',this.perfil());
        }





      }
    }
  }

  isBought(item: Item): boolean {
  const specials = this.perfil().stats.specials!;
  return specials.includes(item.name);
}
}
