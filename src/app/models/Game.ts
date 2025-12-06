import Board from './Board';

type SpecialOnline = {
  special1: string,
  special2: string,
  counter1: number,
  counter2: number,
  activeSpecial1: boolean,
  activeSpecial2: boolean
}

export default interface Game {
  gameId: string;
  online: boolean;
  stage: number;
  phase: 'JOINED' | 'WAITING' | 'PLACEMENT' | 'BATTLE' | 'END';
  player1: string;
  avatarPlayer1: string;
  player2: string;
  avatarPlayer2: string;
  turn: string;
  isEnd: boolean;
  boardPlayer1: Board;
  boardPlayer2: Board;
  readyPlayer1: boolean;
  readyPlayer2: boolean;
  winner: string | null;
  specialPlayer1: SpecialOnline | null;
  specialPlayer2: SpecialOnline | null;
}
