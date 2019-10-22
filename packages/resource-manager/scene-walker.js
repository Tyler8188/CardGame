module.exports = 
{

    // Editor.Scene.callSceneScript('resource-manager', 'get-prefab-root', function (err) 
    // {
    //     console.log("change");
    // });

    // 'import-label-string': function (event,id,str) 
    // {
    //     //Editor.log(cc.Canvas.instance);// null;
    //     //Editor.log(cc.find('New Node'));// null;
    //     //Editor.log(cc.find(cc.Node));
	// 	//Editor.log("1111111111");
    //     //cc.find('Canvas').getComponent("HelloWorld").ar.length= 2
    //     //cc.find('Canvas').getComponent("HelloWorld").a.length= 2
    //     // if (event.reply) {
    //     //     //event.reply(null,str);
    //     // }
    //     // Editor.Scene.callSceneScript('resource-manager', 'import-label-string', function (err) 
    //     // {
    //     //     console.log("change");
    //     // });
    //     // Editor.log(vm.jumpHintData.item.uuid);
    //     // var canvas = cc.find('Canvas');
    //     // Editor.log('Root:' + canvas);
    //     // cc.AssetLibrary.loadAsset(vm.jumpHintData.item.uuid, function (error, asset)
    //     // {
    //     //     if(error)
    //     //     {
    //     //         Editor.warn(" prefab uuid error" + error);
    //     //         return;
    //     //     }
    //     //     //let node = asset._instantiate();
    //     //     Editor.log(asset);
    //     // });
    // }
    'get-prefab-root': function (evt,data) 
    {
        var indexs = (data.uuid&&data.uuid!="")?data.uuid.split("/"):[];
        let paths = data.path.split("/");
        var scene = cc.director.getScene();
        var root = scene.children[0];
        if(!root||root.name!=paths.shift())return;
        let node = root;
        for (let i = 0; i < paths.length; i++) 
        {
            node = node.children[indexs[i]];
            if(node.name!=paths[i])
            {
                Editor.error("未找到对应的节点:",data.path);
                return;
            }
        }
        if(node&&node.uuid!=null)
        {
            Editor.Selection.select('node', node.uuid);
            Editor.Ipc.sendToAll('hierarchy:hint', node.uuid);
        }
    }
};