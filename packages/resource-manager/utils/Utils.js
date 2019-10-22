let packageName = "resource-manager";
let Path = require('fire-path');
let assetUtils = Editor.require('packages://' + packageName + '/utils/Asset.js');
module.exports = 
{
    simplifyFilePaths(res,assettype)
    {
        let rootPath = null;
        let arr = [];
        for(let i = 0;i<res.length;i++)
        {
            let path = res[i].url;
            if(path.indexOf("db://internal/")!=-1)continue;// 引擎自带的
            let fileName = Path.basename(path);
            if(assettype=="sprite-frame")
            {
                let ext = Path.extname(fileName);
                if(ext.length==0)// 
                {
                    let pp1 = path.substring(0,path.length-fileName.length-1);
                    if(!this.isSpriteRes(path.substring(0,path.length-fileName.length-1)))continue;
                }
            }else if(assettype=="texture"&&!this.isSpriteRes(path))continue;

            path = path.replace("db://assets/","");
            if(rootPath==null)rootPath = path.replace(fileName,"");
            else rootPath = this.matchSamePath(rootPath,path);
            arr.push({path:path,item:res[i],fileName:fileName,type:assettype});
        }
        if(rootPath!="")
        {
            for (let j = 0; j < arr.length; j++) 
                arr[j].path = arr[j].path.replace(rootPath,"");
        }
        return arr;
    },
    isSpriteRes(p)
    {
        ext = Path.extname(p);
        if(ext.length!=0)
        {
            if(this.isExistRelateRes(p,"_tex"+ext,"_tex.json")&&this.isExistRelateRes(p,"_tex"+ext,"_ske.json"))return false;
            if(this.isExistRelateRes(p,ext,".fnt"))return false;// 位图字体资源
        }
        return true;
    },
    isExistRelateRes(p,replaceWord,newWord)
    {
        let kk = p.replace(replaceWord,newWord);
        if(p==kk)return false;
        return Editor.assetdb.remote.exists(kk);
    },
    matchSamePath(p1,p2)
    {
        if(p1!=""&&p2.indexOf(p1)==-1)
        {
            let arr = p1.split("/");
            while(arr.length>0)
            {
                arr.pop();
                p1 = arr.join("/");
                if(p2.indexOf(p1)!=-1)return p1.length>0?(p1+"/"):p1;
            }
        }
        return p1;
    },
    fixedMatchPath(p,num)
    {
        if(p.length>num)
        {
            p = p.substr(p.length-num);
            p = "..."+p;
        }
        return p;
    },
    findRes(item,arr,callback)
    {
        if(item==null)return;
        var assetsDir = Path.join(Editor.Project.path, "assets/*");
        let adb = Editor.assetdb;
        adb.queryAssets(assetsDir,"scene",(err,res)=>
        {
            this.findUseRes(res,item,"scene",arr);
            adb.queryAssets(assetsDir,"prefab",(err1,res1)=>
            {
                this.findUseRes(res1,item,"prefab",arr);
                adb.queryAssets(assetsDir,["typescript","javascript","json","text"],(err2,res2)=>
                {
                    this.findUseRes(res2,item,"text",arr);
                    adb.queryAssets(assetsDir,"animation-clip",(err2,res3)=>
                    {
                        this.findUseRes(res3,item,"animation",arr);
                        if(callback!=null)callback();
                    });
                    //if(callback!=null)callback();
                });
            });
        });
    },
    findUseRes(res,item,type,arr)
    {
        for (let i = 0; i < res.length; i++) 
        {
            if(res[i].url.indexOf("db://internal/")!=-1)continue;// 引擎自带的
            let farr = [];
            if(type=="text")farr = assetUtils.search(res[i],item.item.url,type);
            else farr = assetUtils.search(res[i],item.item.uuid,type);
            if(farr==null)continue;
            for (let j = 0; j < farr.length; j++) 
            {
                // Editor.log(farr[j].uuid,farr[j].path,"<-----");
                // if(item.item.uuid==farr[j].uuid)continue;
                arr.push({fileName:Path.basename(res[i].path),item:res[i],path:farr[j].path,uuid:farr[j].uuid,type:type});
            }
        }
    },
}