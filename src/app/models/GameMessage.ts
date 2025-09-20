import Game from "./Game";

export default interface GameMessage {
  phase: 'JOINED' | 'WAITING' | 'PLACEMENT' | 'BATTLE' | 'END';
  game?: Game;
}
