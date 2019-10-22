const {ccclass, property} = cc._decorator;

@ccclass
export default class FightModeItem extends cc.Component {

    @property(cc.Node)
    headIcon:cc.Node = null;

    @property(cc.Label)
    nameLabel:cc.Label = null;

    @property([cc.SpriteFrame])
    headIconArr: cc.SpriteFrame[] = [];

    currIndex:number = 0;

    start () {

    }

    initView(index:number)
    {
        if (index == 0)
            this.nameLabel.string = "" + "单机模式";
        else if (index == 1)
            this.nameLabel.string = "" + "策略模式";
        else if (index == 2)
            this.nameLabel.string = "" + "排位模式";

        this.headIcon.getComponent(cc.Sprite).spriteFrame = this.headIconArr[index];
    }
}
