let packageName = "module-manager";
let Electron = require('electron');
let fs = require("fire-fs");
let path = require('fire-path');
let moduleItem = Editor.require('packages://' + packageName + '/panel/item/item.js');
let prefabItem = Editor.require('packages://' + packageName + '/panel/item/prefab-item.js');
let setting = Editor.require('packages://' + packageName + '/settings/Setting.js');
Editor.Panel.extend(
{
    style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",
    $: 
    {
        logTextArea: '#logTextArea',
        container: '#container',
        view: '#view',
        section: '#section',

        moduleCoreSelect:'#moduleCoreSelect',
        moduleNameTxt:'#moduleNameTxt',
        moduleDescribeTxt:"#moduleDescribeTxt",

        binderCoreSelect:'#binderCoreSelect',
        binderNameTxt:'#binderNameTxt',
        bindAttrTxt:'#bindAttrTxt',

    },
    ready() 
    {
        let logCtrl = this.$logTextArea;
        let view = this.$view;
        let container = this.$container;
        let section = this.$section;
        let moduleNameTxt = this.$moduleNameTxt;
        let binderNameTxt = this.$binderNameTxt;
        let moduleDescribeTxt = this.$moduleDescribeTxt;
        let bindAttrTxt = this.$bindAttrTxt;
        let moduleCoreSelect = this.$moduleCoreSelect;
        let binderCoreSelect = this.$binderCoreSelect;
        const adb = Editor.assetdb;
        setting.init();
        // 注册自定义组件
        moduleItem.init();
        prefabItem.init();
        let logListScrollToBottom = function () 
        {
            setTimeout(()=>logCtrl.scrollTop = logCtrl.scrollHeight, 10);
        };
        let resizeScroll = function () 
        {
            if (container && view && container.scrollHeight < view.clientHeight) 
            {
                section.style.height = (view.clientHeight - 30) + 'px';
                container.style.height = (view.clientHeight - 15) + 'px';
            }
        };

        moduleNameTxt.addEventListener('change', event => 
        {
            let ddd = moduleNameTxt.value+"";
            if(ddd.indexOf("Module")==-1)ddd = ddd+="Binder";
            else ddd = ddd.replace("Module","Binder");
            binderNameTxt.value = ddd;
           
        });
        window.addEventListener('resize', ()=>resizeScroll());
        window.plugin = new window.Vue(
        {
            
            el: this.shadowRoot,
            created()
            {
                resizeScroll();
            },
            init()
            {
                setTimeout(()=>this.setProfile(),100);
            },
            data:
            {
                logView: [],
                onlyShowModuleClass:true,
                onlyShowBinderClass:true,
                isCreateModuleDir:true,
                isCreateBinder:true,
                coreFilePath:"",
                moduleFilePath:"",
                moduleName:"",
                superModuleName:"",
                binderName:"",
                superBinderName:"",
                superClassIgnores:
                [
                    "FObject","FDispose","FStore","cc.Component","ReceiveHandler","GameDealInfoVO",
                    "StatisticsInfoVO","Loader","FEvent","GameBetInfoVO","SimplePlayerVO"
                ],
                prefabs:[],
                getNodeChildByName:"",
                cores:[],
                superModuleClass:[],
                superBinderClass:[],
                superModuleArr:[],
                superBinderArr:[],
                selectedPrefabs:"",

                currentModules: 
                [
                    // {path: "test",name:"大厅模块"}
                ],
            },
            methods:
            {
                onShowModuleClassChange()
                {
                    this.onlyShowModuleClass=!this.onlyShowModuleClass;
                    this.superModuleArr = this.onlyShowModuleClass?this.superModuleClass:this.cores;
                },
                onShowBinderClassChange()
                {
                    this.onlyShowBinderClass=!this.onlyShowBinderClass;
                    this.superBinderArr = this.onlyShowBinderClass?this.superBinderClass:this.cores;
                },
                setProfile()
                {
                    this.moduleFilePath = setting.profile().moduleFilePath;
                    this.coreFilePath = setting.profile().coreFilePath;
                    if(this.coreFilePath!="")
                    {
                        let superClassDict = {};
                        this.parseCoreDatas(this.coreFilePath,superClassDict);
                        this.parseSuperDatas(superClassDict);
                    }
                    this.onFindPrefabs();
                    //this.onLoadModules();

                    this.superModuleArr = this.onlyShowModuleClass?this.superModuleClass:this.cores;
                    this.superBinderArr = this.onlyShowBinderClass?this.superBinderClass:this.cores;
                },
                _addLog(str)
                {
                    let time = new Date();
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                onLoadModules()
                {
                    var assetsDir = path.join(Editor.Project.path, "assets/*");
                    let adb = Editor.assetdb;
                    let superClassDict = {};
                    let scriptList = [];
                    adb.queryAssets(assetsDir,'typescript',(err,res)=>
                    {
                        for(let j = 0;j<res.length;j++)
                            this.checkScriptContent(res[j],scriptList,superClassDict);
                        this.findCurrentModules(scriptList,superClassDict);
                    });
                },
                onPrefabSelected()
                {
                    this.selectedPrefabs = "";
                    for (let k = 0; k < this.prefabs.length; k++) 
                    {
                        if(this.prefabs[k].selected)
                            this.selectedPrefabs+=this.prefabs[k].value+',';
                    }
                    if(this.selectedPrefabs.length>0&&this.selectedPrefabs.charAt(this.selectedPrefabs.length-1)==",")
                        this.selectedPrefabs = this.selectedPrefabs.substring(0,this.selectedPrefabs.length-1);
                },
                findCurrentModules(scriptList,superClassDict)
                {
                    this.currentModules.length = 0;
                    for (let i = 0; i < scriptList.length; i++) 
                    {
                        let o = scriptList[i];
                        if(this.coreFilePath!=null&&o.path.indexOf(this.coreFilePath)==0)continue;
                        let cName = o.name;
                        let ko = {supers:[],implements:[]};
                        while(superClassDict[cName]!=null)
                        {
                            let so = superClassDict[cName];
                            if(so.supers.length>0)
                            {
                                ko.supers = ko.supers.concat(so.supers);
                                cName = so.supers[0];
                            }
                            if(so.implements.length>0)
                            {
                                ko.implements = ko.implements.concat(so.implements);
                                cName = so.implements[0];
                            }
                            if(so.implements.length==0&&so.supers.length==0)break;
                        }
                        if(ko.implements.indexOf('IModule')!=-1)this.currentModules.push(o);   
                    }
                },
                onFindPrefabs()
                {
                    var assetsDir = path.join(Editor.Project.path, "assets/resources/Prefabs/*");
                    let adb = Editor.assetdb;
                    adb.queryAssets(assetsDir,'prefab',(err,res)=>
                    {
                        for(let j = 0;j<res.length;j++)
                        {
                            if(!res[j]&&!res[j].url)continue;
                            if(res[j].url.indexOf("db://internal/prefab/")!=-1)continue;// 引擎自带的预制体
                            if(res[j].url.indexOf("db://assets/resources/Prefabs/")==-1)continue;// 不在Prefabs目录下的预制体
                            let prefab = res[j].url.replace("db://assets/resources/Prefabs/","").replace(".prefab","");
                            this.prefabs.push({value:prefab,selected:false,url:res[j].url,path:res[j].path});
                        }
                    });
                },
                onOpenFileDir(filePath)
                {
                    let openDir = null;
                    let tmpDir = path.join(Editor.Project.path, "assets/"+filePath);
                    if (fs.existsSync(tmpDir)) openDir = tmpDir;
                    if (openDir) 
                    {
                        Electron.shell.showItemInFolder(openDir);
                        Electron.shell.beep();
                    } else console.log("目录错误: " + openDir);
                },
                onSelectCoreDir()
                {
                    let res = Editor.Dialog.openFile(
                    {
                        defaultPath: path.join(Editor.Project.path, "assets/"),
                        properties: ['openDirectory']
                    });
                    if (res !== -1)
                    {
                        this.coreFilePath = res+"";
                        this.cores.length = 0;
                        let superClassDict = {};
                        this.parseCoreDatas(this.coreFilePath,superClassDict);
                        this.parseSuperDatas(superClassDict);
                        setting.profile().coreFilePath = this.coreFilePath;
                        setting.save();
                        
                    }
                },
                parseCoreDatas(s,superClassDict)
                {
                    let pa = fs.readdirSync(s);  
                    for (let i = 0; i < pa.length; i++) 
                    {
                        let ele = pa[i];
                        let info = fs.statSync(s+"/"+ele);
                        if(info.isDirectory())
                        {
                            this.parseCoreDatas(s+"/"+ele,superClassDict);
                        }else
                        {
                            if(ele.indexOf(".d.ts")==-1)
                            {
                                if(ele.indexOf(".ts")==ele.length-3)
                                {
                                    let fileData = fs.readFileSync(s+"/"+ele, {encoding:"utf8"});
                                    ele = ele.replace(".ts","");
                                    if(this.isValidScript(ele,fileData))
                                    {
                                        superClassDict[ele] = this.findSuperInfo(ele,fileData);
                                        let pp = (s+"/"+ele).replace(this.coreFilePath,"");
                                        this.cores.push({text:pp,value:pp,name:ele});
                                    }else if(ele=="getNodeChildByName")
                                    {
                                        this.getNodeChildByName = (s+"/"+ele).replace(this.coreFilePath,"");
                                    }
                                }
                            }
                        }
                    }
                },
                parseSuperDatas(superClassDict)
                {
                    this.superBinderClass.length = 0;
                    this.superModuleClass.length = 0;
                    for (let i = 0; i < this.cores.length; i++) 
                    {
                        let o = this.cores[i];
                        let cName = o.name;
                        let ko = {supers:[],implements:[]};
                        while(superClassDict[cName]!=null)
                        {
                            let so = superClassDict[cName];
                            if(so.supers.length>0)
                            {
                                ko.supers = ko.supers.concat(so.supers);
                                cName = so.supers[0];
                            }
                            if(so.implements.length>0)
                            {
                                ko.implements = ko.implements.concat(so.implements);
                                cName = so.implements[0];
                            }
                            if(so.implements.length==0&&so.supers.length==0)break;
                        }
                        if(ko.implements.indexOf('IModule')!=-1)this.superModuleClass.push(o);   
                        if(ko.implements.indexOf("IBinder")!=-1)this.superBinderClass.push(o);
                    }
                },
                findSuperInfo(fileName,content)
                {
                    let str = "export class "+fileName+" extends ";
                    let index = content.indexOf(str);
                    let isInterface = false;
                    if(index==-1)
                    {
                        str = "export default class "+fileName+" extends ";// 纯类
                        index = content.indexOf(str);
                        if(index==-1)
                        {
                            isInterface = true;
                            str = "export class "+fileName+" implements ";// 实现了某个接口的类
                            index = content.indexOf(str);
                            if(index==-1)
                            {
                                str = "export default class "+fileName+" implements ";// 实现了某个接口的类
                                index = content.indexOf(str);
                            }
                        }
                    }
                    if(index==-1)return;
                    index = index+str.length;
                    let endIndex = content.indexOf("{",index);
                    let infoStr = content.substring(index,endIndex).replace(/\r/g,"").replace(/\n/g,"");//.split(" ");
                    if(infoStr.charAt(infoStr.length-1)==" ")infoStr = infoStr.substring(0,infoStr.length-1);
                    let infoArr = infoStr.split(" ");
                    let supers = [];
                    let implements = [];
                    if(isInterface)implements = infoArr[0].split(",");
                    else 
                    {
                        supers.push(infoArr[0]);
                        if(infoArr.length>2)implements = infoArr[2].split(",");
                    }
                    return {supers:supers,implements:implements};
                },
                isValidScript(fileName,content)
                {
                    let str = "";
                    if(fileName=="FBinder")return true;
                    str = "export class "+fileName+" implements IModule";// 实现了某个接口的类
                    if(content.indexOf(str)!=-1)return true;
                    str = "export class "+fileName+" implements IMediator";// 实现了某个接口的类
                    if(content.indexOf(str)!=-1)return true;
                    str = "export class "+fileName+" implements IContext";// 实现了某个接口的类
                    if(content.indexOf(str)!=-1)return true;
                    str = "export class "+fileName+" implements IProxy";// 实现了某个接口的类
                    if(content.indexOf(str)!=-1)return true;
                    str = "export class "+fileName+" implements IBinder";// 实现了某个接口的类
                    if(content.indexOf(str)!=-1)return true;
                    str = "enum "+fileName;// 枚举
                    if(content.indexOf(str)!=-1)return false;
                    str = "interface "+fileName;//接口
                    if(content.indexOf(str)!=-1)return false;
                    str = "export function "+fileName;// 全局方法
                    if(content.indexOf(str)!=-1)return false;
                    str = "export default function "+fileName;// 全局方法
                    if(content.indexOf(str)!=-1)return false;
                    str = "export class "+fileName+" implements ";// 实现了某个接口的类
                    if(content.indexOf(str)!=-1)return false;
                    str = "export default class "+fileName+" implements ";// 实现了某个接口的类
                    if(content.indexOf(str)!=-1)return false;

                    str = "export class "+fileName+" extends ";// 纯类
                    if(content.indexOf(str)==-1)
                    {
                        str = "export default class "+fileName+" extends ";// 纯类
                        if(content.indexOf(str)==-1)return false;
                    }
                    for (let i = 0; i < this.superClassIgnores.length; i++) 
                    {
                        str = "export class "+fileName+" extends "+this.superClassIgnores[i];
                        if(content.indexOf(str)!=-1)return false;
                        str = "export default class "+fileName+" extends "+this.superClassIgnores[i];
                        if(content.indexOf(str)!=-1)return false;
                    }
                    return true;
                },
                onSelectModuleDir()
                {
                    let res = Editor.Dialog.openFile(
                    {
                        defaultPath: path.join(Editor.Project.path, "assets/"),
                        properties: ['openDirectory']
                    });
                    if (res !== -1)
                    {
                        this.moduleFilePath = res+"";
                        setting.profile().moduleFilePath = this.moduleFilePath;
                        setting.save();
                    }
                },
                onCreateModule()
                {
                    if(this.coreFilePath!="")
                    {
                        if(this.moduleFilePath!="")
                        {
                            let mdn = moduleNameTxt.value+"";
                            if(mdn.length!=0)
                            {

                                if(moduleCoreSelect.value=="{{ option.text }}"||(this.isCreateBinder&&binderCoreSelect.value=="{{ option.text }}"))
                                {
                                    this._addLog("请选择正确的父类继承关系！！！");
                                    return;
                                }
                                let str = "";
                                let mdn = moduleNameTxt.value+"";
                                let bdn = binderNameTxt.value+"";
                                let mdd = moduleDescribeTxt.value+"";
                                let mdfs = "";
                                let sbdPath = "";
                                let bdPath = "";
                                let mcore = moduleCoreSelect.value+"";
                                if(mcore=="{{ option.text }}")mcore = "";
                                let li = mcore.lastIndexOf("/");
                                if(li==-1)li = mcore.lastIndexOf("\\");
                                let smdn = li==-1?"":mcore.substr(li+1);
                                let smdPath = this.getImportURL(this.coreFilePath+mcore,this.moduleFilePath,this.isCreateModuleDir);
                                let moduleTemplate = fs.readFileSync(Editor.url('packages://' + packageName + '/templates/module.txt', 'utf8')) + "";
                                moduleTemplate = moduleTemplate.replace(/{ModuleClassName}/g,mdn);
                                moduleTemplate = moduleTemplate.replace(/{SuperModuleName}/g,smdn);
                                moduleTemplate = moduleTemplate.replace(/{SuperModulePath}/g,smdPath);
                                moduleTemplate = moduleTemplate.replace(/{ModuleName}/g,mdd);
                                for (let k = 0; k < this.prefabs.length; k++) 
                                {
                                    if(this.prefabs[k].selected)
                                        mdfs+='"'+this.prefabs[k].value+'",';
                                }
                                if(mdfs.length>0&&mdfs.charAt(mdfs.length-1)==",")
                                    mdfs = mdfs.substring(0,mdfs.length-1);
                                moduleTemplate = moduleTemplate.replace(/{ModulePrefabs}/g,mdfs);
                                let bAttr = bindAttrTxt.value+"";
                                bAttr = bAttr.replace(/[.]/g,"/");
                                if(bAttr=="")
                                {
                                    str = "protected bindViews():void\n"+
                                    "	{\n"+
                                    "		let view = getNodeChildByName(this.node,{BindNode});\n"+
                                    "		if(this.binder&&view)\n"+
                                    "            this.binder.bindView(view);\n"+
                                    "	}";
                                    moduleTemplate = moduleTemplate.replace(str,"");
                                    str = 'import { getNodeChildByName } from "{getNodeChildByNamePath}";';
                                    moduleTemplate = moduleTemplate.replace(str,"");
                                }else
                                {
                                    moduleTemplate = moduleTemplate.replace(/{BindNode}/g,"'"+bAttr+"'");
                                    let gggg = this.getImportURL(this.coreFilePath+this.getNodeChildByName,this.moduleFilePath,this.isCreateModuleDir);
                                    moduleTemplate = moduleTemplate.replace(/{getNodeChildByNamePath}/g,gggg);
                                }
                                if(this.isCreateBinder)
                                {
                                    bdPath = "./"+bdn;
                                    moduleTemplate = moduleTemplate.replace(/{BinderName}/g,bdn);
                                    moduleTemplate = moduleTemplate.replace(/{BinderPath}/g,bdPath);
     
                                    let binderTemplate = fs.readFileSync(Editor.url('packages://' + packageName + '/templates/binder.txt', 'utf8')) + "";
                                    binderTemplate = binderTemplate.replace(/{BinderClassName}/g,bdn);
                                    mcore = binderCoreSelect.value+"";
                                    if(mcore=="{{ option.text }}")mcore = "";
                                    let li = mcore.lastIndexOf("/");
                                    if(li==-1)li = mcore.lastIndexOf("\\");
                                    let sbdn = li==-1?"":mcore.substr(li+1);
                                    binderTemplate = binderTemplate.replace(/{SuperBinderName}/g,sbdn);
                                    sbdPath = this.getImportURL(this.coreFilePath+mcore,this.moduleFilePath,this.isCreateModuleDir);
                                    binderTemplate = binderTemplate.replace(/{SuperBinderPath}/g,sbdPath);
                                    binderTemplate = binderTemplate.replace(/{BinderName}/g,mdd);
                                    
                                    let saveBinderPath = this.moduleFilePath+(this.isCreateModuleDir?"/"+mdn+"/":"/")+bdn+".ts";
                                    if (!fs.existsSync(path.dirname(saveBinderPath))) 
                                        fs.mkdirsSync(path.dirname(saveBinderPath));
                                    saveBinderPath = saveBinderPath.replace(Editor.Project.path+"\\","db://");
                                    saveBinderPath = saveBinderPath.replace(/\\/g,"/");
                                    Editor.assetdb.create(saveBinderPath,binderTemplate);
                                    this._addLog(saveBinderPath+" 创建成功！！！");
                                }else 
                                {
                                    moduleTemplate = moduleTemplate.replace(/import { {BinderName} } from "{BinderPath}";/g,"");
                                    moduleTemplate = moduleTemplate.replace(/private {BindAttr}:cc.Node = null;/g,"");
                                    str = "this.binder = new {BinderName}();";
                                    moduleTemplate = moduleTemplate.replace(str,"");
                                    str = "this.{BindAttr} = getNodeChildByName(this.node,{BindNode});";
                                    moduleTemplate = moduleTemplate.replace(str,"");
                                }
                                let saveModulePath = this.moduleFilePath+(this.isCreateModuleDir?"/"+mdn+"/":"/")+mdn+".ts";
                                if (!fs.existsSync(path.dirname(saveModulePath))) 
                                    fs.mkdirsSync(path.dirname(saveModulePath));
                                saveModulePath = saveModulePath.replace(Editor.Project.path+"\\","db://");
                                saveModulePath = saveModulePath.replace(/\\/g,"/");
                                Editor.assetdb.create(saveModulePath,moduleTemplate);
                                this._addLog(saveModulePath+" 创建成功！！！");
                                this.onLoadModules();
                            }else this._addLog("请输入正确的模块名称！！！");
                        }else this._addLog("请选择需要保存的模块目录！！！");
                    }else this._addLog("请选择核心库所在目录！！！");
                },
                checkScriptContent(item,scriptList,superClassDict)
                {
                    if(item.url.indexOf(".d.ts")!=-1)return;
                    let fileName = this.getFileName(item.url);
                    if(fileName==null)return;
                    let fileData = fs.readFileSync(item.path, {encoding:"utf8"});
                    if(!this.isValidScript(fileName,fileData))return;
                    superClassDict[fileName] = this.findSuperInfo(fileName,fileData);

                    let desc = "";
                    let dIndex = fileData.indexOf("@description:");
                    if(dIndex!=-1)
                    {
                        dIndex+=13;
                        let endIndex = fileData.indexOf("*/",dIndex);
                        desc = fileData.substring(dIndex,endIndex-1).replace(/\r/g,"").replace(/\n/g,"");
                    }

                    scriptList.push({name:fileName,path:item.path,url:item.url,desc:desc,filePath:item.url.replace("db://assets/","")});
                },
                getFileName(str)
                {
                    let i1 = str.lastIndexOf("/");
                    let i2 = str.lastIndexOf(".ts");
                    if(i1==-1||i2==-1)return null;
                    else return str.substring(i1+1,i2);
                },
                getImportURL(f1,f2,b)
                {
                    f1 = f1.replace(Editor.Project.path+"\\assets\\","");
                    f2 = f2.replace(Editor.Project.path+"\\assets\\","");
                    let ff = b?"../":"";
                    if(f2.length!=0)
                    {
                        let arr = f2.split("\\");
                        for (let i = 0; i < arr.length; i++) 
                            ff+="../";
                    }
                    ff+=f1;
                    return ff;
                },
            }
        });
    },
    messages: 
    {
        'module-manager:hello'(event) 
        {
        }
    }
});