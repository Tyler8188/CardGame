let fs = require('fire-fs');
let packageName = "module-manager";

module.exports = {
    init() {
        console.log("prefab-item 注册组件!");
        Vue.component('prefab-item', 
		{
            props: ['data'],
            template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/item/prefab-item.html', 'utf8')) + "",
            created() 
			{    
            },
            methods: 
			{    
                onChange()
                {
                    let c = this.$el.querySelector("ui-checkbox");
                    this.data.selected = c.checked;
                    window.plugin.onPrefabSelected();
                    //Editor.log(c.checked,this.data);
                    //Editor.log(this.$el.getElementById("prefabCheckbox"));
                },
                onClickBtnPingPong()
                {
                    let uuid = Editor.assetdb.remote.urlToUuid(this.data.url);
                    Editor.Ipc.sendToAll('assets:hint', uuid);
                },
                onClickBtnEdite()
                {
                    let uuid = Editor.assetdb.remote.urlToUuid(this.data.url);
                    Editor.Ipc.sendToAll('scene:enter-prefab-edit-mode', uuid);
                }
            },
            computed: {},
        });
    }
};