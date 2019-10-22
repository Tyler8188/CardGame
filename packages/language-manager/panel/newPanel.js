let packageName = "language-manager";
let Fs = require("fire-fs");
let Path = require('fire-path');
let setting = Editor.require('packages://' + packageName + '/setting/Setting.js');
Editor.Panel.extend(
{
    style: Fs.readFileSync(Editor.url('packages://' + packageName + '/panel/newPanel.css', 'utf8')) + "",
    template: Fs.readFileSync(Editor.url('packages://' + packageName + '/panel/newPanel.html', 'utf8')) + "",
    $: 
    {

    },
    ready() 
    {
        // 注册自定义组件
        this.plugin = new window.Vue(
        {
            el: this.shadowRoot,
            created()
            {
            },
            init()
            {
                
            },
            data:
            {
                fileName:"",
                rootPath:"",
                errMsg:""
            },
            methods:
            {
                onCreateNewLanguage()
                {
                    if(this.fileName.length==0)
                    {
                        this.errMsg = "文件名不能为空";
                        return;
                    }
                    
                    let p = Path.join(this.rootPath,this.fileName+".json");
                    if (Fs.existsSync(p))
                    {
                        this.errMsg = "多语言文件 "+this.fileName+".json 已经存在!";
                        return;
                    } 
                    this.errMsg = "";
                    //Editor.Ipc.sendToPanel('language-manager:create-language',this.fileName);
                    Editor.Ipc.sendToPanel("language-manager","create-language",this.fileName);
                },
            }
        });
    },
    run(args)
    {
        this.plugin.rootPath = args;

    },
    messages: 
    {
    }
});