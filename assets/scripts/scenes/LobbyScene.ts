import FightModeItem from "../src/LobbyModule/FightModeItem";
import BaseModule from "../src/BaseModule";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LobbyScene extends cc.Component {

    @property(cc.Node)
    moduleCon:cc.Node = null;

    @property(cc.Node)
    fightModeCon:cc.Node = null;

    @property(cc.Prefab)
    fightModeItem:cc.Prefab = null;

    @property(cc.Node)
    rankBtn:cc.Node = null;

    @property(cc.Node)
    shopBtn:cc.Node = null;

    @property(cc.Node)
    drunkeryBtn:cc.Node = null;

    @property(cc.Node)
    activityBtn:cc.Node = null;

    @property(cc.Node)
    settingBtn:cc.Node = null;


    start () {
        for (let i = 0; i < 3; ++i)
        {
            let modeItem = cc.instantiate(this.fightModeItem);
            modeItem.getComponent(FightModeItem).initView(i);
            modeItem.x = (modeItem.width + 20) * i - 250;
            this.fightModeCon.addChild(modeItem);
        }

        this.moduleCon.active = false;

        this.addEvents();
    }

    addEvents()
    {
        this.rankBtn.on(cc.Node.EventType.TOUCH_START, this.onBtnClick, this);
		this.shopBtn.on(cc.Node.EventType.TOUCH_START, this.onBtnClick, this);
        this.drunkeryBtn.on(cc.Node.EventType.TOUCH_START, this.onBtnClick, this);
        this.activityBtn.on(cc.Node.EventType.TOUCH_START, this.onBtnClick, this);
        this.settingBtn.on(cc.Node.EventType.TOUCH_START, this.onBtnClick, this);
    }

    onBtnClick(evt:cc.Event.EventCustom)
    {
        let moduleName:string = evt.currentTarget.name;
        let moduleIndex:number = 0;
        this.moduleCon.active = true;
        let baseModule:BaseModule = this.moduleCon.getComponent(BaseModule);

        switch (moduleName) {
            case "RankBtn":
                moduleIndex = 0;
                break;
            case "ShopBtn":
                moduleIndex = 1;
                break;
            case "DrunkeryBtn":
                moduleIndex = 2;
                break;
            case "ActivityBtn":
                moduleIndex = 3;
                break;
            case "SettingBtn":
                moduleIndex = 4;
                break;
            default:
                moduleIndex = 0;
                break;
        }
        baseModule.initView(moduleIndex);
    }

}
