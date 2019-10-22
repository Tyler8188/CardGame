import GamePlayer from "../src/GamePlayer";
import { GameCampType } from "../src/GameData";
import { GameMessageMatchOver } from "../net/GameMessageBase";

export default class GameDataManager
{
    public static selfPlayer:GamePlayer = null;
    public static otherPlayer:GamePlayer = null;

    public static myPlayerUid:string = "";

    public static updateMatchOver(msg:GameMessageMatchOver):void
    {
        console.log("updateMatchOver:", msg);
        this.selfPlayer = new GamePlayer();
        this.selfPlayer.uId = msg.myUid;
        this.selfPlayer.campType = GameCampType.Right;
        this.selfPlayer.userName = msg.myUserName;
        this.selfPlayer.firstHandUid = msg.firstHandUid;
        this.selfPlayer.isSelf = true;

        this.otherPlayer = new GamePlayer();
        this.otherPlayer.uId = msg.otherUid;
        this.otherPlayer.campType = GameCampType.Left;
        this.otherPlayer.userName = msg.otherUserName;
        this.otherPlayer.firstHandUid = msg.firstHandUid;
        this.otherPlayer.isSelf = false;
    }
    
}
