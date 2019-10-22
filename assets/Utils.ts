const {ccclass, property} = cc._decorator;

@ccclass
export default class Utils {
    public static ClassName:string = "Utils";
    public static curDR:cc.Size = null;

    public static removeItemToPool(listRoot){
        for(var i = 0; i < listRoot.childrenCount; ++i){
            listRoot.children[i].active = false;
        }
    };
    
    public static addItemFromPool(listRoot){
        for(var i = 0; i < listRoot.childrenCount; ++i){
            var child = listRoot.children[i];
            if(child.active == false){
                child.active = true;
                return child;
            }
        }
    
        var newChild = cc.instantiate(listRoot.children[0]);
        listRoot.addChild(newChild);
        return newChild;
    };

    public static loadScene(scene,cb?:any){
        let self = this;
        self.curDR = null;

        cc.director.loadScene(scene,function(){
            console.log(scene + ' loaded');
            Utils.resize();
            if(cb){
                cb();
            }
        });
    }

    public static resize() {
        
        var cvs = cc.find('Canvas').getComponent(cc.Canvas);
        //保存原始设计分辨率，供屏幕大小变化时使用
        if(!this.curDR){
            this.curDR = cvs.designResolution;
        }
        var dr = this.curDR;
        var s = cc.view.getFrameSize();
        var rw = s.width;
        var rh = s.height;
        var finalW = rw;
        var finalH = rh;

        if((rw/rh) > (dr.width / dr.height)){
            //!#zh: 是否优先将设计分辨率高度撑满视图高度。 */
            //cvs.fitHeight = true;
            
            //如果更长，则用定高
            finalH = dr.height;
            finalW = finalH * rw/rh;
        }
        else{
            /*!#zh: 是否优先将设计分辨率宽度撑满视图宽度。 */
            //cvs.fitWidth = true;
            //如果更短，则用定宽
            finalW = dr.width;
            finalH = rh/rw * finalW;
        }
        cvs.designResolution = cc.size(finalW, finalH);
        cvs.node.width = finalW;
        cvs.node.height = finalH;
        cvs.node.emit('resize');
    }
}
