import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { GameService } from '../../../../services/game/game.service';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { NgClass } from '@angular/common';
import { PerfilService } from '../../../../services/game/perfil.service';
import { ChatComponent } from "../chat/chat.component";
import { ChatBoxComponent } from "../chat-box/chat-box.component";
import { ChatService } from '../../../../services/chat/chat.service';
import { SpecialService } from '../../../../services/game/special.service';

@Component({
  selector: 'app-mini-board',
  imports: [NgClass, ChatComponent, ChatBoxComponent],
  templateUrl: './mini-board.component.html',
  styleUrl: './mini-board.component.css',
})
export class MiniBoardComponent implements OnInit{
  ngOnInit(): void {
    this.specialService.asignSpecialBoss(this.game()?.stage || 1);
    const _nicknameRival = this.gameService.me() === 'player1' ? this.game()?.player2 : this.game()?.player1;
    const playerRival = this.gameService.me() === 'player1' ? 'player2' : 'player1';
    if(playerRival === 'player2'){
      this.playerRivalSlot1.set(this.specialService.getSpecial(this.game()?.specialPlayer2?.special1 || '', _nicknameRival!));  
      this.playerRivalSlot2.set(this.specialService.getSpecial(this.game()?.specialPlayer2?.special2 || '', _nicknameRival!));
    } else{
      this.playerRivalSlot1.set(this.specialService.getSpecial(this.game()?.specialPlayer1?.special1 || '', _nicknameRival!));  
      this.playerRivalSlot2.set(this.specialService.getSpecial(this.game()?.specialPlayer1?.special2 || '', _nicknameRival!));
    }
  }

  gameService = inject(GameService);
  storageService = inject(StorageService);
  chatService = inject(ChatService);
  perfilService = inject(PerfilService);
  specialService = inject(SpecialService);

  perfil = this.perfilService.perfil();
  showChatbox = this.chatService.showChatbox;
  bossSlot1 = this.specialService.specialBossSlot1;
  bossSlot2 = this.specialService.specialBossSlot2;
  playerSlot1 = this.specialService.specialPlayerSlot1;
  playerSlot2 = this.specialService.specialPlayerSlot2;
  playerRivalSlot1 = this.specialService.specialPlayerRivalSlot1;
  playerRivalSlot2 = this.specialService.specialPlayerRivalSlot2;
  counterBossSlot1 = computed(() => this.specialService.counterBossSlot1());
  counterBossSlot2 = computed(() => this.specialService.counterBossSlot2());
  counterPlayerSlot1 = computed(() => this.specialService.counterPlayerSlot1());
  counterPlayerSlot2 = computed(() => this.specialService.counterPlayerSlot2());
  counterPlayerRivalSlot1 = computed(() => this.specialService.counterPlayerRivalSlot1());
  counterPlayerRivalSlot2 = computed(() => this.specialService.counterPlayerRivalSlot2());
  activeBossSpecial1 = computed(() => {
    const counter = this.specialService.counterBossSlot1();
    return this.specialService.adminSpecialCounter(this.bossSlot1()?.name!, this.counterBossSlot1());  
  });
  activeBossSpecial2 = computed(() => {
    const counter = this.specialService.counterBossSlot2();
    return this.specialService.adminSpecialCounter(this.bossSlot2()?.name!, this.counterBossSlot2());  
  });
  activePlayerSpecial1 = computed(() => {
    const counter = this.specialService.counterPlayerSlot1();
    return this.specialService.adminSpecialCounter(this.playerSlot1()?.name!, this.counterPlayerSlot1());  
  });
  activePlayerSpecial2 = computed(() => {
    const counter = this.specialService.counterPlayerSlot2();
    return this.specialService.adminSpecialCounter(this.playerSlot2()?.name!, this.counterPlayerSlot2());  
  });
  activePlayerRival1 = computed(() => {
    const counter = this.specialService.counterPlayerRivalSlot1();
    return this.specialService.adminSpecialCounter(this.playerRivalSlot1()?.name!, this.counterPlayerRivalSlot1());  
  });
  activePlayerRival2 = computed(() => {
    const counter = this.specialService.counterPlayerRivalSlot2();
    return this.specialService.adminSpecialCounter(this.playerRivalSlot2()?.name!, this.counterPlayerRivalSlot2());  
  });


  readyBossSpecial1 = this.specialService.readyBossSpecial1;
  readyBossSpecial2 = this.specialService.readyBossSpecial2;
  readyPlayerSpecial1 = computed(() => this.specialService.readyPlayerSpecial1());
  readyPlayerSpecial2 = computed(() => this.specialService.readyPlayerSpecial2());
  readyPlayerRivalSpecial1 = computed(() => this.specialService.readyPlayerRivalSpecial1());
  readyPlayerRivalSpecial2 = computed(() => this.specialService.readyPlayerRivalSpecial2());
  
  avatarRival = computed(() => {
    return this.perfil.nickname === this.game()?.player1 ? this.game()?.avatarPlayer2 : this.game()?.avatarPlayer1;
  });
  game = computed(() => {
    return this.gameService.gameDTO();
  });

  meBoard = computed(() => {
    const board = this.perfil.nickname === this.game()?.player1 ? this.game()?.boardPlayer1 : this.game()?.boardPlayer2;
    return board;
  });
  boardRival = computed(() => {
    const board = this.perfil.nickname === this.game()?.player1 ? this.game()?.boardPlayer2 : this.game()?.boardPlayer1;
    return board;
  });

  me = computed(() => {
    return this.gameService.me();
  });

  constructor() {
    effect(() => {
      const _activeBossSpecial1 = this.activeBossSpecial1();
      const _activeBossSpecial2 = this.activeBossSpecial2();
      if (_activeBossSpecial1) {
        this.readyBossSpecial1.set(true);
      }
      if (_activeBossSpecial2) {
        this.readyBossSpecial2.set(true);
      }
    });
  
  }


}