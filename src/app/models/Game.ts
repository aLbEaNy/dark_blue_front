import Board from './Board';

export default interface Game {
  gameId: string;
  stage: number;
  phase: 'PLACEMENT' | 'BATTLE' | 'END';
  player1: string;
  avatarPlayer1: string;
  player2: string;
  avatarPlayer2: string;
  me: 'player1' | 'player2';
  turn: string;
  isEnd: boolean;
  winner: string | null;
  boardPlayer1: Board;
  boardPlayer2: Board;
  readyPlayer1: boolean;
  readyPlayer2: boolean;
}
