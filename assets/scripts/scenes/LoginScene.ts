import EventManager from "../manager/EventManager";
import NetManager from "../manager/NetManager";
import GameMessageBase, { GameMessageC2S_Match, GameMessageC2S_Login, GameMessageC2S_Regist, GameMessageS2C_Regist, GameMessageS2C_Login, GameMessageMatchOver } from "../net/GameMessageBase";
import GameEvent from "../events/GameEvent";
import GameDataManager from "../manager/GameDataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginScene extends cc.Component {

    @property(cc.EditBox)
    nameLabel: cc.EditBox = null;

    @property(cc.EditBox)
    passwordLabel: cc.EditBox = null;

    @property(cc.Label)
    desLabel: cc.Label = null;

    @property(cc.Node)
    registerBtn:cc.Node = null;

    @property(cc.Node)
    loginBtn:cc.Node = null;

    @property(cc.Node)
    enterBtn:cc.Node = null;

    isPreloadDragBallScene:boolean = false;

    isLoginCompleted:boolean = false;

    currStatus:number = 0;//当前游戏状态，0.注册， 1.登录

    countDown:number = 3;

    start () {
        cc.director.preloadScene("FightScene", function () {
            this.isPreloadDragBallScene = true;
        }.bind(this));

        this.registerBtn.on( cc.Node.EventType.TOUCH_START, this.onRegisterBtnClick, this);

        this.loginBtn.on( cc.Node.EventType.TOUCH_START, this.onLoginBtnClick, this);

        this.enterBtn.on( cc.Node.EventType.TOUCH_START, this.onEnterBtnClick, this);

        EventManager.registEvent(GameEvent.Login_Response, this.loginResponseHander, this);

        EventManager.registEvent(GameEvent.Register_Response, this.registerResponseHander, this);

        EventManager.registEvent(GameEvent.Match_Response, this.matchResponseHander, this);

        EventManager.registEvent(GameEvent.Server_Connected, this.connectedHander, this);
    }

    onRegisterBtnClick():void
    {
        this.currStatus = 0;
        NetManager.getInstance().connectWebScoket();
    }

    onLoginBtnClick():void
    {
        this.currStatus = 1; 
        let nameStr:string = this.nameLabel.string;
        let passwordStr:string = this.passwordLabel.string;
        let msg = new GameMessageC2S_Login(nameStr, passwordStr);
        
        NetManager.getInstance().connectWebScoket();
    }

    onEnterBtnClick():void
    {
        this.desLabel.string = "匹配中...";
        NetManager.getInstance().sendWebSocket(new GameMessageC2S_Match());
    }

    matchResponseHander(msg:GameMessageMatchOver):void
    {
        this.schedule(this.schduleHandler, 1, 3, 1);
    }

    schduleHandler():void
    {
        this.countDown--;
        this.desLabel.string = "开始倒计时：" + this.countDown;
        if (this.countDown == 0)
        {
            this.unschedule(this.schduleHandler);
            cc.director.loadScene("FightScene");
        }
    }

    registerResponseHander(msg:GameMessageS2C_Regist):void
    {
        let msgStr:string = "";
        if (msg.code == 1)
        {
            msgStr = "注册失败";
        }
        else
        {
            msgStr = "注册成功";
        }
        
        this.desLabel.string = msgStr;
    }


    loginResponseHander(msg:GameMessageS2C_Login):void
    {
        let msgStr:string = "";
        if (msg.code == 1)
        {
            msgStr = "登录失败";
        }
        else
        {
            msgStr = "登录成功";
        }


        GameDataManager.myPlayerUid = msg.uid;
        this.desLabel.string = msgStr;
        this.isLoginCompleted = true;
    }

    connectedHander():void
    {
        if (this.currStatus == 0)
        {
            this.register();
        }
        else
        {
            this.loginGame();
        }
    }
    
    register():void
    {
        let nameStr:string = this.nameLabel.string;
        let passwordStr:string = this.passwordLabel.string;

        let msg = new GameMessageC2S_Regist(nameStr, passwordStr);
        
        NetManager.getInstance().sendWebSocket(msg);
    }

    loginGame():void
    {
        let nameStr:string = this.nameLabel.string;
        let passwordStr:string = this.passwordLabel.string;

        let msg = new GameMessageC2S_Login(nameStr, passwordStr);
        
        NetManager.getInstance().sendWebSocket(msg);
    }

    // update (dt) {}
}
