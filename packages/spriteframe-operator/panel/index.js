let packageName = "spriteframe-operator";
let Fs = require('fire-fs');
let Path = require('fire-path');
let utils = Editor.require('packages://' + packageName + '/utils/Utils.js');
Editor.Panel.extend(
{
    style: Fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: Fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",
    $: 
    {
        logTextArea: '#logTextArea',
    },
    ready() 
    {
        let logCtrl = this.$logTextArea;
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
                uuid:'',
                replaceuuid:'',
                logView: [],
                targets:[],
                dict:[],
            },
            watch:
            {
                uuid(){this.refreshTargets()},
                replaceuuid(){}
            },
            methods:
            {
                refreshTargets()
                {
                    while(this.targets.length>0)
                        this.targets.pop();
                    if(this.uuid.length==0)return;
                    utils.searchSpriteFrames(this.uuid,(arr)=>
                    {
                        this.targets = arr;
                        this.addLog("查找到"+arr.length+"个资源");
                    });
                },
                addLog(str)
                {
                    let time = new Date();
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    this.logListScrollToBottom();
                },
                logListScrollToBottom() 
                {
                    setTimeout(()=>logCtrl.scrollTop = logCtrl.scrollHeight, 10);
                },
                onPingPongResource(item)
                {
                    Editor.Ipc.sendToAll('assets:hint', item.uuid);
                },
                onEditeResource(item)
                {
                    if(item.type=="prefab")Editor.Ipc.sendToAll('scene:enter-prefab-edit-mode', item.uuid);
                    else if(item.type=="scene")Editor.Ipc.sendToMain("scene:open-by-uuid", item.uuid);
                    else if(item.type=="sprite-frame")Editor.Panel.open("sprite-editor", {uuid:item.uuid});
                    //else if(item.type=="animation-clip")Editor.Panel.open("animation-editor", {uuid:item.uuid});
                    else if(item.type=="texture")Editor.Ipc.sendToMain("assets:open-texture-file", item.uuid);
                    else if(item.type=="typescript"||item.type=="javascript"||item.type=="json"||item.type=="text")
                        Editor.Ipc.sendToMain("assets:open-text-file", item.uuid);
                    else this.addLog("不支持打开的文件格式："+item.type);
                },
                onReplaceResource(item)
                {
                    let type = item.type;
                    let uuid = item.uuid;
                    let fileData = Fs.readFileSync(item.path, {encoding:"utf8"});
                    let assetName = Editor.assetdb.remote.uuidToUrl(this.uuid);
                    assetName = Path.basenameNoExt(assetName);
                    let newAssetName = Editor.assetdb.remote.uuidToUrl(this.replaceuuid);
                    newAssetName = Path.basenameNoExt(newAssetName);
                    if(type=="typescript"||type=="javascript"||type=="json"||type=="text")
                    {
                        
                        let arr = ['"'+assetName+'"',"'"+assetName+"'",'/'+assetName+'"',"/"+assetName+"'",'\\'+assetName+'"',"\\"+assetName+"'",'?:'+assetName+'"','?:'+assetName+"'"];
                        while(true)
                        {
                            let str = "";
                            let index = -1;
                            let isFind = false;
                            for (let i = 0; i < arr.length; i++) 
                            {
                                str = arr[i];
                                index = fileData.indexOf(str);
                                if(index!=-1)
                                {
                                    isFind = true;
                                    let p = fileData.charAt(index+str.length)==";"?1:0;
                                    fileData = fileData.substr(0,index)+str.replace(assetName,newAssetName)+(p==0?"":";")+fileData.substring(index+str.length+p);
                                }
                            }
                            if(!isFind)break;
                        }
                    }else
                    {
                        fileData = fileData.replace(new RegExp(this.uuid,'g'),this.replaceuuid);
                    }
                    Editor.assetdb.saveExists(item.url,fileData);
                    Editor.assetdb.refresh(true);
                    if(type=="prefab")Editor.Ipc.sendToAll('scene:enter-prefab-edit-mode', item.uuid);
                    this.addLog(item.url.replace("db://assets/","")+"-->"+assetName+"-->"+newAssetName+" 替换成功");
                    this.dict.push(item);
                    //this.refreshTargets();
                },
            }
        });
    },
    messages: 
    {
        'scene:ready' ()
        {
        },
        'scene:enter-prefab-edit-mode'()
        {
        },
    }
});