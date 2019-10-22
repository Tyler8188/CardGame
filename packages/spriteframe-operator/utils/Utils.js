let packageName = "resource-manager";
let Path = require('fire-path');
let Fs = require('fire-fs');
let adb = Editor.assetdb;
let assetsDir = Path.join(Editor.Project.path, "assets/*");
module.exports = 
{
    searchSpriteFrames(uuid,cb)
    {
        let arr = [];
        this.searchScenes(uuid,(a)=>
        {
            arr = arr.concat(a);
            this.searchPrefabs(uuid,(b)=>
            {
                arr = arr.concat(b);
                this.searchAnimations(uuid,(c)=>
                {
                    arr = arr.concat(c);
                    this.searchScripts(uuid,(d)=>
                    {
                        arr = arr.concat(d);
                        cb(arr);
                    });
                });
            });
        })

    },
    findContent(type,uuid,res)
    {
        let arr = [];
        let assetName = "";
        if(type=="text")
        {
            let url = Editor.assetdb.remote.uuidToUrl(uuid);
            assetName = Path.basenameNoExt(url);
        }
        
        for (let i = 0; i < res.length; i++) 
        {
            let item = res[i];
            if(item.url.indexOf("db://internal/")!=-1)continue;// 引擎自带的资源素材
            if(item.url.indexOf(".d.ts")!=-1)continue;// ts说明文件
            if(uuid==item.uuid)continue;// 比对的两个是同一个文件
            if(type=="uuid")
            {
                let jsonPath = item.destPath;
                let jsonStr = Fs.readFileSync(jsonPath, {encoding:"utf8"});
                if(jsonStr.indexOf(uuid)==-1)continue;
                arr.push(item);
            }else if(type=="text")
            {
                let jsonStr = Fs.readFileSync(item.path, {encoding:"utf8"});
                if(jsonStr.indexOf(assetName)==-1)continue;
                if(jsonStr.indexOf('"'+assetName+'"')!=-1||jsonStr.indexOf("'"+assetName+"'")!=-1||
                jsonStr.indexOf('/'+assetName+'"')!=-1||jsonStr.indexOf("/"+assetName+"'")!=-1||
                jsonStr.indexOf('\\'+assetName+'"')!=-1||jsonStr.indexOf("\\"+assetName+"'")!=-1||
                jsonStr.indexOf('?:'+assetName+'"')!=-1||jsonStr.indexOf('?:'+assetName+"'")!=-1)
                    arr.push(item);
            }
        }
        return arr;
    },
    queryAssets(assets,callback)
    {
        adb.queryAssets(assetsDir,assets,(err,res)=>callback(res));
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
            cb(this.findContent("uuid",data,res));
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
}