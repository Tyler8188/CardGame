let packageName = "resource-manager";

let fs = require("fire-fs");
let path = require('fire-path');
let asset = Editor.require('packages://' + packageName + '/utils/Asset.js');
let utils = Editor.require('packages://' + packageName + '/utils/Utils.js');
let resUtils = Editor.require('packages://' + packageName + '/utils/ResUtils.js');
Editor.Panel.extend(
{
    style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",
    $: 
    {
        resouceType:"#resouceType",
        keyword:"#keyword"
    },
    ready() 
    {
        let resouceType = this.$resouceType;
        let keyword = this.$keyword;
        this.plugin = new window.Vue(
        {
            el: this.shadowRoot,
            created()
            {
            },
            init()
            {
                setTimeout(()=>this.setProfile(),30);
            },
            data:
            {
                isFindUnuseRes:false,
                isMatchFilePath:false,
                jumpHintData:null,
                isShowResourcePath:false,
                currentRes:null,
                resouceTypes:[],
                findRescources:[],
                resources:[],
                resourceDatas:[],
                unuseTotal:0,
                unuseCurrent:0,
            },
            methods:
            {
                setProfile()
                {
                    this.resouceTypes = asset.types;
                },
                onResouceTypeChange()
				{
                    this.currentRes = null;
                    this.resources.length = 0;
                    while(this.resourceDatas.length>0)
                        this.resourceDatas.pop();
                    while(this.findRescources.length>0)
                        this.findRescources.pop();
                    let index = asset.types.indexOf(resouceType.value);
                    if(index==-1)return;
                    var assetsDir = path.join(Editor.Project.path, "assets/*");
                    let adb = Editor.assetdb;
                    let assetType = asset.typeAssetKeys[index];
                    if(assetType!="unuse-res")
                    {
                        this.isFindUnuseRes = false;
                        if(assetType=="dup-res")
                        {
                            resUtils.searchDuplicateRes(assetType,()=>{},
                            (c)=>
                            {
                                this.resources = c;
                                this.onMatchKeyword(false);
                            });
                        }else
                        {
                            adb.queryAssets(assetsDir,assetType,(err,res)=>
                            {
                                this.resources = utils.simplifyFilePaths(res,assetType);
                                this.onMatchKeyword(false);
                            });
                        }
                    }else
                    {
                        this.isFindUnuseRes = true;
                        resUtils.searchInvalidRes(assetType,(a,b)=>
                        {
                            this.unuseCurrent = a;
                            this.unuseTotal = b;
                        },(c)=>
                        {
                            this.isFindUnuseRes = false;
                            this.resources = c;
                            this.onMatchKeyword(false);
                        });
                    }
                },
                onMatchKeyword(flag)
                {
                    let v = keyword.value+"";
                    if(flag)this.isMatchFilePath=!this.isMatchFilePath;
                    while(this.resourceDatas.length>0)
                        this.resourceDatas.pop();
                    for (let i = 0; i < this.resources.length; i++) 
                    {
                        if(v.length==0)this.resourceDatas.push(this.resources[i]);
                        else 
                        {
                            if(this.isMatchFilePath)
                            {
                                if(this.resources[i].path.indexOf(v)!=-1)
                                    this.resourceDatas.push(this.resources[i]);
                            }else
                            {
                                if(this.resources[i].fileName.indexOf(v)!=-1)
                                    this.resourceDatas.push(this.resources[i]);
                            }
                        }
                    }
                },
                onEditeResource(item)
                {
                    if(item.type=="prefab")Editor.Ipc.sendToAll('scene:enter-prefab-edit-mode', item.item.uuid);
                    else if(item.type=="scene")Editor.Ipc.sendToMain("scene:open-by-uuid", item.item.uuid);
                    else if(item.type=="sprite-frame")Editor.Panel.open("sprite-editor", {uuid:item.item.uuid});
                    else if(item.type=="texture")Editor.Ipc.sendToMain("assets:open-texture-file", item.item.uuid);
                    else if(item.type=="typescript"||item.type=="javascript"||item.type=="json"||item.type=="text")
                        Editor.Ipc.sendToMain("assets:open-text-file", item.item.uuid);
                },
                onSearchResource(item)
                {
                    this.currentRes = item;
                    while(this.findRescources.length>0)
                        this.findRescources.pop();
                    utils.findRes(this.currentRes,this.findRescources);
                },
                onPingPongResource(item)
                {
                    Editor.Ipc.sendToAll('assets:hint', item.item.uuid);
                    
                },
                fixedFilePathName(item)
                {
                    if(this.isShowResourcePath)return utils.fixedMatchPath(item.path,50);
                    else return item.fileName;
                },
                isShowEditorBtn(item)
                {
                    if(item.type=="sprite-atlas")return false;
                    if(item.type=="bitmap-font")return false;
                    if(item.type=="raw-asset")return false;
                    if(item.type=="audio-clip")return false;
                    if(item.type=="animation-clip")return false;
                    if(item.type=="dragonbones")return false;
                    if(item.type=="dragonbones-atlas")return false;
                    return true;
                },
                onOpenResource(item)
                {
                    if(item.type=="prefab")
                    {
                        this.jumpHintData = item;
                        Editor.Ipc.sendToAll('scene:enter-prefab-edit-mode', item.item.uuid);
                    }else if(item.type=="scene")
                    {
                        this.jumpHintData = item;
                        //Editor.Selection.select('asset',item.item.uuid);
                        Editor.Ipc.sendToMain("scene:open-by-uuid", item.item.uuid);
                    }else if(item.type=="text")
                    {
                        Editor.Ipc.sendToMain("assets:open-text-file", item.item.uuid);
                    } 
                },
            }
        });
    },
    messages: 
    {
        'scene:ready' ()
        {
            let vm = this.plugin;
            if(vm&&vm.jumpHintData)
            {
                setTimeout(() => 
                {
                    if(vm.jumpHintData == null)return;
                    Editor.Selection.select('node', vm.jumpHintData.uuid);
                    Editor.Ipc.sendToAll('hierarchy:hint', vm.jumpHintData.uuid);
                    vm.jumpHintData = null;
                }, 500);
            }
        },
        'scene:enter-prefab-edit-mode'()
        {
            let vm = this.plugin;
            if(vm&&vm.jumpHintData)
            {
                setTimeout(() =>
                {
                    if(vm.jumpHintData == null)return;
                    Editor.Scene.callSceneScript('resource-manager', 'get-prefab-root',vm.jumpHintData);
                    vm.jumpHintData = null;
                },500);
            }
        },
        // 'selection:activated' ( event, type, id )
        // {
        //     if ( type !== 'node' || !id ) return;
        //     // let node = cc.engine.getInstanceById(id);
        //     // let itemPath = node ? _Scene.NodeUtils.getNodePath(node) : '';
        //     // let asUuid = Editor.Selection.curSelection('asset') //资源管理器中当前选择的文件的uuid
        //     // let nodeUuid = Editor.Selection.curSelection('node') //层级管理器中当前选择的节点的uuid
        //     Editor.log(">>>>>>>>>>>>>>>>222",Editor.Selection.curSelection('node'));
        // },
        // 'selection:deactivated' ( event, type, id )
        // {
        //     if ( type !== 'node' || !id ) return;
        //     Editor.log(">>>>>>>>>>>>>>>>333",id,type);
        // },
    }
});