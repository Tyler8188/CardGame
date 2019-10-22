import SkillAnimConfig from "./SkillAnimConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SkillAnim extends cc.Component {
    public static ClassName:string = "SkillAnim";

    @property
    roleId:string = '0001';

    @property
    defaultAnim:string = '';

    private _spriteFrames:Array<cc.SpriteFrame> = [];
    private _lastStartTime = 0;

    private getAnimInfo(animName:string):any{
        var info = SkillAnimConfig.getSkillInfo(this.roleId);
        return info[animName];
    }

    onLoad () {
    }

    playSkillAnim(animName:string){
        var aniInfo = this.getAnimInfo(animName);
        if(!aniInfo){
            return null;
        }
        this.defaultAnim = animName;
        this._lastStartTime = Date.now();
        
        var folder =  'skillEffects/' + this.roleId + '/';
        console.log("playSkillAnim------:", animName, folder);
        var arr = [];
        for(var i = 0; i < aniInfo.frames; ++i){
            var url = folder + animName + '/frame' + i;
            arr.push(url);
        }
        cc.loader.loadResArray(arr,cc.SpriteFrame,function(err,arr){
            this._spriteFrames = arr;
        }.bind(this));
    }

    stopSkillAnim()
    {
        this.playSkillAnim('');
    }

    start () {
        this.playSkillAnim(this.defaultAnim);
    }

    update (dt) {
        if(!this._lastStartTime || !this._spriteFrames.length){
            return;
        }

        var fps = this.getAnimInfo(this.defaultAnim).fps;

        var index = Math.floor((Date.now() - this._lastStartTime) / 1000 * fps);
        if(index > this._spriteFrames.length){
            this.playSkillAnim('');
            return;
        }
        index %= this._spriteFrames.length;
        this.node.getComponent(cc.Sprite).spriteFrame = this._spriteFrames[index];
    }
}
