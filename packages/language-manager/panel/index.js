let packageName = "language-manager";

let Fs = require("fire-fs");
let Path = require('fire-path');
let utils = Editor.require('packages://' + packageName + '/utils/Utils.js');
let setting = Editor.require('packages://' + packageName + '/setting/Setting.js');

Editor.Panel.extend(
{
    style: Fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: Fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",
    $: 
    {

    },
    ready() 
    {
        setting.init();
        // 注册自定义组件
        this.plugin = new window.Vue(
        {
            el: this.shadowRoot,
            created()
            {
            },
            init()
            {
                setTimeout(() => this.getSettingData(), 500);
            },
            data:
            {
                rootPath:"",
                languages:[],
                languageDatas:[],
                templanguageDatas:[],
                tid:-1,
            },
            methods:
            {
                getSettingData()
                {
                    let p = setting.profile().rootPath;
                    if(p==null||p.length==0)return;
                    if(!this.isValidPath(p))return;
                    this.rootPath=p;
                    this.findRootPathLanguages();
                    
                },
                onSelectRootPath()
                {
                    let res = Editor.Dialog.openFile(
                    {
                        defaultPath: Path.join(Editor.Project.path, "assets/"),
                        properties: ['openDirectory']
                    });
                    if (res !== -1)
                    {
                        let p = res+"";
                        if(!this.isValidPath(p))return;
                        this.rootPath = p;
                        this.findRootPathLanguages();
                    }
                },
                onRootPathChange()
                {
                    if(!this.isValidPath())return;
                    this.findRootPathLanguages();
                },
                findRootPathLanguages()
                {
                    setting.profile().rootPath = this.rootPath;
                    setting.save();
                    while(this.languages.length>0)
                        this.languages.pop();
                    while(this.languageDatas.length>0)
                        this.languageDatas.pop();
                    this.templanguageDatas.length = 0;
                    this.languages = utils.findLanguageFiles(this.rootPath);
                    if(this.languages.length==0)return;
                    this.templanguageDatas = utils.parseLanguageDatas(this.languages);
                    this.languages.unshift({name:"",path:null,json:null});
                    this.filterLanguageDatas();
                    this.saveLanguages();
                },
                filterLanguageDatas()
                {
                    if(this.templanguageDatas.length==0)return;
                    let keyword = "";
                    for (let i = 0; i < this.templanguageDatas.length; i++) 
                    {
                        if(keyword.length==0)
                            this.languageDatas.push(this.templanguageDatas[i]);
                        else
                        {

                        }
                    }
                },
                onAddLanguage()
                {
                    Editor.Panel.open("language-manager-new",this.rootPath);
                },
                onLanguageDataChange(index,index1)
                {
                    let items = this.languageDatas[index];
                    if(index1==0)
                    {
                        items[index1].key = items[index1].value;
                        for (let i = 1; i < items.length; i++) 
                            items[i].key = items[index1].value;
                    }
                    if(this.tid!=-1)clearTimeout(this.tid);
                    this.tid = setTimeout(() => this.saveLanguages(), 500);
                },
                onAddLanguageData()
                {
                    let isAdd = utils.addNewLanguageData(this.templanguageDatas,this.languages);
                    if(isAdd)
                    {
                        this.filterLanguageDatas();
                        this.saveLanguages();
                    }
                },
                saveLanguages()
                {
                    let dict = {};
                    for (let i = 0; i < this.languages.length; i++) 
                    {
                        if(this.languages[i].path==null||this.languages[i].path=="")continue;
                        dict[this.languages[i].name]={path:this.languages[i].path,json:{}};
                    }
                    for (let j = 0; j < this.templanguageDatas.length; j++) 
                    {
                        let items = this.templanguageDatas[j];
                        for (let k = 0; k < items.length; k++) 
                        {
                            if(items[k].file==null||items[k].file=="")continue;
                            dict[items[k].file].json[items[k].key] = items[k].value;
                        }
                    }
                    for(ss in dict)
                    {
                        let p = dict[ss].path;
                        p = p.replace(Editor.Project.path+"\\","db://");
                        p = p.replace(Editor.Project.path+"/","db://");
                        p = p.replace(/\\/g,"/");
                        Editor.assetdb.saveExists(p,JSON.stringify(dict[ss].json));
                        Editor.assetdb.refresh(true);
                    }
                },
                isValidPath(str=null)
                {
                    if(str==null)str = this.rootPath;
                    if(str.length>0)
                    {
                        let isExist = Fs.existsSync(str);
                        if(isExist)
                        {
                            let info = Fs.statSync(str);
                            return info.isDirectory();
                        }
                    }
                    return false;
                },
                createLanguage(fileName)
                {
                    fileName = Path.join(this.rootPath,fileName+".json");
                    fileName = fileName.replace(Editor.Project.path+"\\","db://");
                    fileName = fileName.replace(Editor.Project.path+"/","db://");
                    fileName = fileName.replace(/\\/g,"/");
                    Editor.assetdb.createOrSave(fileName,"{}");
                    Editor.assetdb.refresh(true);
                    setTimeout(() => this.findRootPathLanguages(), 500);
                }
            }
        });
    },
    messages: 
    {
        'create-language':function(e,arg)
        {
            this.plugin.createLanguage(arg);
        }
    }
});