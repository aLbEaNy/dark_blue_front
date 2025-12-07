import { Component, computed, effect, inject, input, OnInit, signal, untracked } from '@angular/core';
import { GameService } from '../../../../services/game/game.service';
import { StorageService } from '../../../../services/store/storageLocal.service';
import { NgClass } from '@angular/common';
import { PerfilService } from '../../../../services/game/perfil.service';
import { ChatComponent } from "../chat/chat.component";
import { ChatBoxComponent } from "../chat-box/chat-box.component";
import { ChatService } from '../../../../services/chat/chat.service';
import { SpecialService } from '../../../../services/game/special.service';
import { WebSocketService } from '../../../../services/webSocket/webSocket.service';
import GameMessage from '../../../../models/GameMessage';

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
  }

  gameService = inject(GameService);
  storageService = inject(StorageService);
  chatService = inject(ChatService);
  perfilService = inject(PerfilService);
  specialService = inject(SpecialService);
  webSocketService = inject(WebSocketService);

  perfil = this.perfilService.perfil();
  showChatbox = this.chatService.showChatbox;
  bossSlot1 = this.specialService.specialBossSlot1;
  bossSlot2 = this.specialService.specialBossSlot2;

  playerSlot1 = this.specialService.specialPlayerSlot1;
  playerSlot2 = this.specialService.specialPlayerSlot2;

  playerRivalSlot1 = this.specialService.specialPlayerRivalSlot1();
  playerRivalSlot2 = this.specialService.specialPlayerRivalSlot2();

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
  msgSocket = input<GameMessage>();

  meActiveSlot1 = signal(false);
  meActiveSlot1Comp  = computed(() => {
    return this.meActiveSlot1();
  });
  meActiveSlot2 = signal(false);
  meActiveSlot2Comp  = computed(() => {
    return this.meActiveSlot2();
  });
  rivalActiveSlot1 = signal(false);
  rivalActiveSlot1Comp = computed(() => {
    return this.rivalActiveSlot1();
  });
  rivalActiveSlot2 = signal(false);
  rivalActiveSlot2Comp = computed(() => {
    return this.rivalActiveSlot2();
  });
  firstTime = true;

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

    effect(() => {
      const _msgSocket = this.msgSocket();
      if(!_msgSocket || !_msgSocket.game) return;
      untracked(()=>{
        if (this.me() === 'player1'){
          this.meActiveSlot1.set(_msgSocket.game?.specialPlayer1?.activeSpecial1!);
          this.meActiveSlot2.set(_msgSocket.game?.specialPlayer1?.activeSpecial2!);
          this.rivalActiveSlot1.set(_msgSocket.game?.specialPlayer2?.activeSpecial1!);
          this.rivalActiveSlot2.set(_msgSocket.game?.specialPlayer2?.activeSpecial2!);
        } else {
          this.meActiveSlot1.set(_msgSocket.game?.specialPlayer2?.activeSpecial1!);
          this.meActiveSlot2.set(_msgSocket.game?.specialPlayer2?.activeSpecial2!);
          this.rivalActiveSlot1.set(_msgSocket.game?.specialPlayer1?.activeSpecial1!);
          this.rivalActiveSlot2.set(_msgSocket.game?.specialPlayer1?.activeSpecial2!);
        }
        
      });
    });
  
  }


}