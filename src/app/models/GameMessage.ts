import Game from "./Game";

type ShotResult = {
  hit: boolean;
  miss: boolean;
  destroyed: boolean;
};

export default interface GameMessage {
  
  phase?: 'EXIT' | 'JOINED' | 'WAITING' | 'PLACEMENT' | 'BATTLE' | 'END';
  game?: Game;
  lastShot?: ShotResult;
  multiShotResults?: ShotResult[];
  player?: string;
  slot?: number;
  special?: string;

  type?: 'GAME' | 'CHAT' | 'EXIT' | 'SPECIAL';
  sender?: string;
  content?: string;
  timestamp?: string;
}
