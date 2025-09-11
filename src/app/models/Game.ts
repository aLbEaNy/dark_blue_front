import Board from './Board';

export default interface Game {
  gameId: string;
  online: boolean;
  stage: number;
  phase: 'PLACEMENT' | 'BATTLE' | 'END';
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
}
