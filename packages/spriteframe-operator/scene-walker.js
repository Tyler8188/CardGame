module.exports = 
{
    'get-prefab-root': function (evt,data) 
    {
		Editor.log("1111111111111111");
        // var indexs = (data.uuid&&data.uuid!="")?data.uuid.split("/"):[];
        // let paths = data.path.split("/");
        // var scene = cc.director.getScene();
        // var root = scene.children[0];
        // if(!root||root.name!=paths.shift())return;
        // let node = root;
        // for (let i = 0; i < paths.length; i++) 
        // {
            // node = node.children[indexs[i]];
            // if(node.name!=paths[i])
            // {
                // Editor.error("未找到对应的节点:",data.path);
                // return;
            // }
        // }
        // if(node&&node.uuid!=null)
        // {
            // Editor.Selection.select('node', node.uuid);
            // Editor.Ipc.sendToAll('hierarchy:hint', node.uuid);
        // }
    }
};