import { GamePhase } from "./GamePhase";
import IBoard from "./IBoard";

export default interface IGameDTO {
    
    gameId: string,
    stage: string,
    phase: GamePhase,

    player1: string,
    player2: string,
    turn: string,

    isEnd: boolean,
    winner: string | null,

    boardPlayer1: IBoard,
    boardPlayer2: IBoard,

    readyPlayer1: boolean,
    readyPlayer2: boolean,


}