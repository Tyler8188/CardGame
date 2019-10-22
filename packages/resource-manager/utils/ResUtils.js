let packageName = "resource-manager";
let Path = require('fire-path');
let utils = Editor.require('packages://' + packageName + '/utils/Utils.js');
let Fs = require('fire-fs');
let adb = Editor.assetdb;
let assetsDir = Path.join(Editor.Project.path, "assets/*");
let cacheDict = {};
module.exports = 
{
    searchInvalidRes(assetType,progress,complete)
    {
        cacheDict = {};
        this.queryAssets(["prefab","sprite-frame"],(res)=>
        {
            this.searchFiles(res,assetType,progress,complete);
        });
    },
    queryAssets(assets,callback)
    {
        adb.queryAssets(assetsDir,assets,(err,res)=>callback(res));
    },
    searchFiles(res,assetType,progress,complete)
    {
        let index = 0;
        let arr = [];
        progress(index,res.length);
        let callFun = function(isFind)
        {
            if(!isFind)
            {
                let path = res[index].url.replace("db://assets/","");
                let fileName = Path.basename(path);
                arr.push({path:path,item:res[index],fileName:fileName,type:assetType});
            }
            index++;
            progress(index,res.length);
            if(index>=res.length)
            {
                complete(arr);
            }else this.searchFile(res,index,callFun.bind(this));
        }
        this.searchFile(res,index,callFun.bind(this));
    },
    searchFile(res,index,cb)
    {
        let data = res[index];
        let path = data.url;
        if(path.indexOf("db://internal/")!=-1)cb(true);// 引擎自带的资源素材
        else
        {
            if(data["type"]=="sprite-frame")// 
            {
                let dirname = Path.dirname(path);
                let ext = Path.extname(dirname);
                if(ext.length!=0)
                {
                    if((utils.isExistRelateRes(dirname,ext,".json")&&utils.isExistRelateRes(dirname,"_tex"+ext,"_ske.json"))||
                    utils.isExistRelateRes(dirname,ext,".fnt")||utils.isExistRelateRes(dirname,ext,".plist"))
                    {
                        cb(true);// 引擎自带的资源素材
                        return;
                    }
                }
            }
            this.searchScenes(data,(isSceneFind)=>
            {
                if(isSceneFind)cb(isSceneFind);
                else this.searchPrefabs(data,(isPrefabFind)=>
                {
                    if(isPrefabFind)cb(isPrefabFind);
                    else this.searchAnimations(data,(isAnimFind)=>
                    {
                        if(isAnimFind)cb(isAnimFind);
                        else this.searchScripts(data,(isScriptFind)=>
                        {
                            cb(isScriptFind);
                        });
                    });
                });
            });
        }
    },
    searchScenes(data,cb)
    {
        this.queryAssets("scene",(res)=>
        {
            cb(this.findContent("uuid",data,res));
        });
    },
    searchPrefabs(data,cb)
    {
        this.queryAssets("prefab",(res)=>
        {
            cb(this.findContent("uuid",data,res))
        });
    },
    searchAnimations(data,cb)
    {
        this.queryAssets("animation-clip",(res)=>
        {
            cb(this.findContent("uuid",data,res))
        });
    },
    searchScripts(data,cb)
    {
        this.queryAssets(["typescript","javascript","json","text"],(res)=>
        {
            cb(this.findContent("text",data,res))
        });
    },
    findContent(type,asset,res)
    {
        for (let i = 0; i < res.length; i++) 
        {
            let item = res[i];
            if(item.url.indexOf("db://internal/")!=-1)continue;// 引擎自带的资源素材
            if(item.url.indexOf(".d.ts")!=-1)continue;// ts说明文件
            if(asset.uuid==item.uuid)continue;// 比对的两个是同一个文件
            if(type=="uuid")
            {
                let jsonPath = item.destPath;
                let jsonStr = cacheDict[jsonPath];
                if(jsonStr==null)
                {
                    jsonStr = Fs.readFileSync(jsonPath, {encoding:"utf8"});
                    cacheDict[jsonPath] = jsonStr;
                }
                if(jsonStr.indexOf(asset.uuid)!=-1)return true;
            }else if(type=="text")
            {
                let assetName = Path.basenameNoExt(asset.url);
                let jsonStr = cacheDict[item.path];
                if(jsonStr==null)
                {
                    jsonStr = Fs.readFileSync(item.path, {encoding:"utf8"});
                    cacheDict[item.path] = jsonStr;
                }
                if(jsonStr.indexOf(assetName)!=-1)
                {
                    if(jsonStr.indexOf('"'+assetName+'"')!=-1||jsonStr.indexOf("'"+assetName+"'")!=-1||
                    jsonStr.indexOf('/'+assetName+'"')!=-1||jsonStr.indexOf("/"+assetName+"'")!=-1||
                    jsonStr.indexOf('\\'+assetName+'"')!=-1||jsonStr.indexOf("\\"+assetName+"'")!=-1||
                    jsonStr.indexOf('?:'+assetName+'"')!=-1||jsonStr.indexOf('?:'+assetName+"'")!=-1)
                        return true;
                }   
            }
        }
        return false;
    },

    searchDuplicateRes(assetType,progress,complete)
    {
        let dict = {};
        let arr = [];
        this.queryAssets("sprite-frame",(res)=>
        {
            for (let i = 0; i < res.length; i++) 
            {
                let asset = res[i];
                if(asset.url.indexOf("db://internal/")!=-1)continue;// 引擎自带的资源素材

                let dirname = Path.dirname(asset.url);
                let ext = Path.extname(dirname);
                if(ext.length!=0)
                {
                    if((utils.isExistRelateRes(dirname,ext,".json")&&utils.isExistRelateRes(dirname,"_tex"+ext,"_ske.json"))||
                    utils.isExistRelateRes(dirname,ext,".fnt")||utils.isExistRelateRes(dirname,ext,".plist"))
                        continue;// 其他资源使用的图片素材
                }
                let fileName = Path.basename(asset.url);
                if(dict[fileName]==null)dict[fileName] = {aItem:null,isAdd:false,asset:asset,path:asset.url.replace("db://assets/","")};
                else 
                {
                    if(!dict[fileName].isAdd)
                    {
                        dict[fileName].isAdd = true;
                        dict[fileName].aItem = {path:dict[fileName].path,item:dict[fileName].asset,fileName:fileName,type:assetType};
                        arr.push(dict[fileName].aItem);
                    }
                    let index = arr.indexOf(dict[fileName].aItem);
                    arr.splice(index,0,{path:asset.url.replace("db://assets/",""),item:asset,fileName:fileName,type:assetType});
                    //arr.push();
                }
            }
            complete(arr);
        });
    },
}