import Utils from "../../Utils";

import GamePlayer from "../src/GamePlayer";
import { GameCampType } from "../src/GameData";
import SkillAnim from "../skill/SkillAnim";
import SpriteAnim from "../skill/SpriteAnim";
import RoleAnimConfig from "../skill/RoleAnimConfig";
import SkillAnimConfig from "../skill/SkillAnimConfig";
import EventManager from "../manager/EventManager";
import GameEvent from "../events/GameEvent";
import { GameMessagePut } from "../net/GameMessageBase";
import NetManager from "../manager/NetManager";
import GameDataManager from "../manager/GameDataManager";
import SkillCD from "../skill/SkillCD";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FightGame extends cc.Component {
    public static ClassName:string = "FightScene";

    @property(cc.Node)
    contentRoot: cc.Node = null;    
    
    @property(SkillAnim)
    skill: SkillAnim = null;

    @property(SpriteAnim)
    hero: SpriteAnim = null;

    @property(cc.Label)
    heroLabel:cc.Label = null;

    @property(SpriteAnim)
    target: SpriteAnim = null;

    @property(cc.Label)
    targetLabel:cc.Label = null;

    @property(cc.Label)
    roundLabel:cc.Label = null;

    currTurnRole:SpriteAnim = null;
    currTargetRole:SpriteAnim = null;

    private _isSpelling:boolean = false;

    private isMyTurn:boolean = false;

    selfPlayer:GamePlayer;
    otherPlayer:GamePlayer;
    currentPlayer:GamePlayer;
    currentPlayerUid:string = "";

    currSpellName:string = "";

    onLoad () 
    {
        Utils.removeItemToPool(this.contentRoot);
        var info = RoleAnimConfig.getRoleInfo(this.hero.roleId);
        var index = 0;
        for(var k in info){
            if(k == 'attcak' || k.indexOf('spell') == 0){
                index++;
                var item = Utils.addItemFromPool(this.contentRoot);
                cc.loader.loadRes('icons/icon_spell' + index,cc.SpriteFrame,function(err,spriteFrame){
                    this.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                }.bind(item));
                item.__meta = k;
            }
        }

        this.creatorPlayers();

        this.addEvents();
    }

    addEvents():void
    {
        EventManager.registEvent(GameEvent.Fight_Response, this.fightResponseHandler, this);
    }

    creatorPlayers()
    {
        this.selfPlayer = GameDataManager.selfPlayer;
        this.otherPlayer = GameDataManager.otherPlayer;
        
        if (this.selfPlayer.uId == this.selfPlayer.firstHandUid)
        {
            this.currentPlayer = this.selfPlayer;
            this.heroLabel.string = "" + this.selfPlayer.userName;
            this.targetLabel.string = "" + this.otherPlayer.userName;
        }
        else
        {
            this.heroLabel.string = "" + this.selfPlayer.userName;
            this.targetLabel.string = "" + this.selfPlayer.userName;
        }

        this.roundLabel.string = "";
    }

    updateRound()
    {
        if(this.currentPlayer.uId == this.selfPlayer.uId)
        {
            this.roundLabel.string = "你的回合";
        }
        else
        {
            this.roundLabel.string = "对手的回合";
        }

        console.log("updateRound:", this.roundLabel.string, this.currentPlayer.uId);
    }

    onFightClick(event)
    {
        if(this.currentPlayer == null)
        {
            return;
        }

        if(this.currentPlayer.isSelf)
        {
            this.currSpellName = event.target.__meta;
            NetManager.getInstance().sendWebSocket(new GameMessagePut(this.selfPlayer.uId, this.currSpellName));

            event.currentTarget.getComponent(SkillCD).onSkillCast();
        }
        //发完消息后，把当前玩家设置为null 。
        this.currentPlayer=null;
    }


    
    fightResponseHandler(msg:GameMessagePut)
    {
        console.log("收到战斗消息回复：", msg, msg.uid, this.selfPlayer.uId);

        this.currentPlayerUid = msg.uid;
       
        this.onCastSpell(msg);
    }

    changePlayer(currentPlayerUid:string)
    {
        if(currentPlayerUid == this.selfPlayer.uId)
        {
    		this.currentPlayer = this.otherPlayer;
        }
        else
        {
    		this.currentPlayer = this.selfPlayer;
        }
        
        this.updateRound();
    }


    getPlayer(uId:string):GamePlayer
    {
        if(uId == this.selfPlayer.uId)
        {
            return this.selfPlayer;
        }
        else if(uId == this.otherPlayer.uId)
        {
            return this.otherPlayer;
        }
    }

    onCastSpell(msg:GameMessagePut)
    {
        this.currSpellName = msg.skillName;
        this.roundLabel.string = "";
        var animName = this.currSpellName;
        if(this._isSpelling){
            return;
        }

        let targetPos:cc.Vec2 = null;
        let skillName:string = "";

        if (this.isMyTurn)
        {
            this.currTurnRole = this.hero;
            this.currTargetRole = this.target;
            targetPos = cc.v2(120,0);
            skillName = "spell0";
        }
        else
        {
            this.currTurnRole = this.target;
            this.currTargetRole = this.hero;
            targetPos = cc.v2(-120,0);
            skillName = "spell1";
        }

        this.skill.node.active = true;
        //攻击效果
        this._isSpelling = true;
        var arr = [];
        arr.push(cc.spawn(cc.moveTo(0.3,this.currTargetRole.node.position.sub(targetPos)),cc.callFunc(function(){
            this.currTurnRole.playAnim('rush');
        },this)) );

        this.currTurnRole.playAnim(animName);
            arr.push(cc.callFunc(function(){
            this.currTargetRole.playAnim("attacked");
            this.skill.playSkillAnim(skillName);
            this.onAttackedSpell(this.currTargetRole);
            this.onCastSkillSpell(this.currTurnRole,this.currTargetRole, skillName);
        }.bind(this),this));

        var animInfo = RoleAnimConfig.getRoleInfo(this.currTurnRole.roleId)[animName];

        if (animInfo == null) 
        {
            console.log("animInfo is null:", this.currTurnRole.roleId, this.currTurnRole, animName);
            return;
        }
        var playTime = animInfo.frames / animInfo.fps;
        arr.push(cc.delayTime(0.5 + playTime));
        arr.push(cc.moveTo(0.1,this.currTurnRole.node.position));
        arr.push(cc.callFunc(function(){
            this._isSpelling = false;
            this.skill.node.active = false;
            this.skill.playSkillAnim(skillName);
        },this));

        var act = cc.sequence(arr);
        this.currTurnRole.node.runAction(act);

        this.schedule(this.schduleHandler, 1, 3, 1);
    }

    countDown:number = 3;
    schduleHandler():void
    {
        this.countDown--;
        this.roundLabel.string = "" + this.countDown;
        if (this.countDown <= 0)
        {
            this.isMyTurn = !this.isMyTurn;//切换回合
            this.changePlayer(this.currentPlayerUid);
            this.countDown = 3;
            this.unschedule(this.schduleHandler);
        }
    }

    onAttackedSpell(targetRole:SpriteAnim):void
    {
        var animInfo = RoleAnimConfig.getRoleInfo(targetRole.roleId)["attacked"];
        var playTime = animInfo.frames / animInfo.fps;
        var act = cc.delayTime(1 + playTime);
        targetRole.node.runAction(act);
    }

    onCastSkillSpell(currRole:SpriteAnim, targetRole:SpriteAnim, skillName:string):void
    {
        this.skill.stopSkillAnim();
        this.skill.node.x = targetRole.node.x;
        var animInfo = SkillAnimConfig.getSkillInfo(currRole.roleId)[skillName];
        this.skill.node.active = true;
        console.log("onCastSkillSpell:", currRole.roleId, animInfo);
        if (animInfo == null) return;
        var playTime = animInfo.frames / animInfo.fps;
        var act = cc.delayTime(1 + playTime);
        this.skill.node.runAction(act);
    }

    start () {

    }

    // update (dt) {}
}
