

export default class GameMessageBase
{
    type:GameMessageType
}

export  class GameMessageC2S extends GameMessageBase
{

}

export  class GameMessageS2C extends GameMessageBase
{
    code:number;
}

export enum GameMessageType
{
    C2S_Regist,
    C2S_Login,
    C2S_Match,
    Hello,
    Match,
    Put,
    S2C_MatchOver,
    S2C_Regist,
    S2C_Login,
    S2C_Put,
}

export class GameMessagePut extends GameMessageBase
{
    type:GameMessageType = GameMessageType.Put;
    uid:string;
    skillName:string;

    constructor(uid:string, skillName:string)
    {
        super();
        this.uid = uid;
        this.skillName = skillName;
    }
}

export class GameMessageS2C_Put extends GameMessageS2C
{
    type:GameMessageType = GameMessageType.S2C_Put;
}

export class GameMessageC2S_Match extends GameMessageC2S {
    type: GameMessageType = GameMessageType.C2S_Match;
}

export class GameMessageMatchOver extends GameMessageBase
{
    type:GameMessageType = GameMessageType.S2C_MatchOver;
    myUid:string;
    myUserName:string;

    otherUid:string;
    otherUserName:string;

    firstHandUid:string;
}

export class GameMessageC2S_Regist extends GameMessageC2S
{
    type:GameMessageType = GameMessageType.C2S_Regist;
    username:string;
    password:string;

    constructor(username:string, password:string)
    {
        super();
        this.username = username;
        this.password = password;
    }
}

export class GameMessageS2C_Regist extends GameMessageS2C
{
    type:GameMessageType = GameMessageType.S2C_Regist;
}

export class GameMessageC2S_Login extends GameMessageC2S
{
    type:GameMessageType = GameMessageType.C2S_Login;
    username:string;
    password:string;

    constructor(username:string, password:string)
    {
        super();
        this.username = username;
        this.password = password;
    }
}

export class GameMessageS2C_Login extends GameMessageS2C
{
    type:GameMessageType = GameMessageType.S2C_Login;
    uid:string;
}