import Game from "./Game";

type ShotResult = {
  hit: boolean;
  miss: boolean;
  destroyed: boolean;
};

export default interface GameMessage {
  
  phase?: 'JOINED' | 'WAITING' | 'PLACEMENT' | 'BATTLE' | 'END';
  game?: Game;
  lastShot?: ShotResult;

  type?: 'GAME' | 'CHAT';
  sender?: string;
  content?: string;
  timestamp?: string;
}
