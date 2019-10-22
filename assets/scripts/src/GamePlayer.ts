import { GameCampType, GameChessType } from "./GameData";

export default class GamePlayer 
{
    public static ClassName:string = "GamePlayer";
    uId:string;
    userName:string;
    isSelf:boolean;
    firstHandUid:string;
    campType:GameCampType;
    chessType:GameChessType;
}
