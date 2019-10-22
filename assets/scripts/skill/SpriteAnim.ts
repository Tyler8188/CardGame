import RoleAnimConfig from "./RoleAnimConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SpriteAnim extends cc.Component {
    public static ClassName:string = "spriteAnim";

    @property
    roleId:string = '0001';

    @property
    defaultAnim:string = 'idle';

    private _spriteFrames:Array<cc.SpriteFrame> = [];
    private _lastStartTime = 0;

    private getAnimInfo(animName:string):any{
        var info = RoleAnimConfig.getRoleInfo(this.roleId);
        return info[animName];
    }

    onLoad () {
    }

    playAnim(animName:string){
        var aniInfo = this.getAnimInfo(animName);
        if(!aniInfo){
            return null;
        }
        this.defaultAnim = animName;
        this._lastStartTime = Date.now();

        var folder =  'roles/' + this.roleId + '/';
        var arr = [];
        for(var i = 0; i < aniInfo.frames; ++i){
            var url = folder + animName + '/frame' + i;
            arr.push(url);
        }
        cc.loader.loadResArray(arr,cc.SpriteFrame,function(err,arr){
            this._spriteFrames = arr;
        }.bind(this));
    }

    start () {
        this.playAnim(this.defaultAnim);
    }

    update (dt) {
        if(!this._lastStartTime || !this._spriteFrames.length){
            return;
        }

        var fps = this.getAnimInfo(this.defaultAnim).fps;

        var index = Math.floor((Date.now() - this._lastStartTime) / 1000 * fps);
        if(index > this._spriteFrames.length){
            this.playAnim('combat_idle');
            return;
        }
        index %= this._spriteFrames.length;
        this.node.getComponent(cc.Sprite).spriteFrame = this._spriteFrames[index];
    }
}
