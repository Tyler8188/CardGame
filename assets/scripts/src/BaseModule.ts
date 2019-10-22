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
export default class BaseModule extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Node)
    closeBtn:cc.Node = null;

    @property(cc.Node)
    moduleIcon:cc.Node = null;

    @property([cc.SpriteFrame])
    moduleIconArr:cc.SpriteFrame[] = [];

    start () {
        this.closeBtn.on(cc.Node.EventType.TOUCH_START, this.onBtnClick, this);
    }

    initView(index:number)
    {
        if (index == 0)
            this.nameLabel.string = "" + "排行榜";
        else if (index == 1)
            this.nameLabel.string = "" + "商城";
        else if (index == 2)
            this.nameLabel.string = "" + "酒馆";
        else if (index == 3)
            this.nameLabel.string = "" + "活动";
        else if (index == 4)
            this.nameLabel.string = "" + "设置";

        this.moduleIcon.getComponent(cc.Sprite).spriteFrame = this.moduleIconArr[index];
    }

    onBtnClick(evt:cc.Event.EventCustom)
    {
        console.log("evt:", evt.currentTarget.name);
        this.node.active = false;
    }
}
