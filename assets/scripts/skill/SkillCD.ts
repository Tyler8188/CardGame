// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class SkillCD extends cc.Component {

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;
    // LIFE-CYCLE CALLBACKS:

    @property(Number)
    cd: Number = 5000;

    // onLoad () {}
    private _cdStart:Number = 0;

    private get isCDing(){
        return this._cdStart > 0;
    }

    onSkillCast(){
        if(this.isCDing){
            return;
        }
        this._cdStart = Date.now();
    }

    start () {
        this.progressBar.progress = 0;
    }

    update (dt) {
        if(this.isCDing){
            // var dt = Date.now() - this._cdStart;  
            // if(dt >= this.cd){
            //     this.progressBar.progress = 0;
            //     this._cdStart = 0;
            // }
            // else{
            //     this.progressBar.progress = 1 - dt / this.cd;
            // }
        }
    }
}
