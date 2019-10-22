let fs = require('fire-fs');
let nodeCmd = require('node-cmd');

let packageName = "module-manager";

module.exports = {
    init() {
        console.log("module-item 注册组件!");
        Vue.component('module-item', {
            props: ['data'],
            template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/item/item.html', 'utf8')) + "",
            created() {
                this.$nextTick(function () {
                    this.onMouseOut();
                })
            },
            methods: {
                onMouseOver() {
                    this.$el.style.backgroundColor = '#777';
                },
                onMouseOut() {
                    let bgColor = '#333';
                    if (this.index % 2) {
                        bgColor = '#333';
                    } else {
                        bgColor = '#444';
                    }
                    this.$el.style.backgroundColor = bgColor;
                },
                onClickBtnOpenFile()
                {
                    Editor.assetdb.explore(this.data.url);
                },
                onClickBtnEdite()
                {
                    let uuid = Editor.assetdb.remote.urlToUuid(this.data.url);
                    Editor.Ipc.sendToMain("assets:open-text-file", uuid);
                    //nodeCmd.run('code '+Editor.Project.path+" "+this.data.path);
                },
                onClickBtnDel()
                {
                    window.plugin._addLog("请手动删除模块，暂不提供插件删除功能！！！");
                },
                onClickBtnPingPong()
                {
                    let uuid = Editor.assetdb.remote.urlToUuid(this.data.url);
                    Editor.Ipc.sendToAll('assets:hint', uuid);
                }
            },
            computed: {},
        });
    }
};