import Game from "./Game";

type ShotResult = {
  hit: boolean;
  miss: boolean;
  destroyed: boolean;
};
type ShotsResponse ={ 
  position: string;
  result: 'HIT' | 'MISS' | 'DESTROYED';
}

export default interface GameMessage {
  
  phase?: 'EXIT' | 'JOINED' | 'WAITING' | 'PLACEMENT' | 'BATTLE' | 'END';
  game?: Game;
  lastShot?: ShotResult;
  shots?: ShotsResponse[];
  player?: string;
  slot?: number;
  special?: string;

  type?: 'GAME' | 'CHAT' | 'EXIT' | 'SPECIAL' | 'AI_SHOTS';
  sender?: string;
  content?: string;
  timestamp?: string;
}
