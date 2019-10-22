'use strict';
const Fs = require('fire-fs');
const Path = require('fire-path');
var _types = 
[
    "Prefab",
    "SpriteFrame",
    "SpriteAtlas",
    "Texture2D",
    "Font",
    "Json",
    "Text",
    "Scene",
    'AudioClip',
    'AnimationClip',
    "DragonBones",
    "TypeScript",
    "JavaScript",
    "Invalid Resources",
    "Duplicate resources"
];

var _typeAssetKeys = 
[
    "prefab",
    "sprite-frame",
    "sprite-atlas",
    "texture",
    "bitmap-font",
    "json",
    "text",
    "scene",
    "audio-clip",
    "animation-clip",
    "dragonbones",
    "typescript",
    "javascript",
    "unuse-res",
    "dup-res"
];

module.exports = 
{
    get types(){return _types;},
    get typeAssetKeys(){return _typeAssetKeys;},
    search(asset, uuid,searchType)
    {
        var paths = [];
        let type = asset["type"];

        if(searchType=="text")
        {
            if(uuid.indexOf(".d.ts")!=-1)return null;
            if(asset.url==uuid)return null;
            let fileName = Path.basename(uuid);
            let ext = Path.extname(fileName);
            fileName = fileName.replace(ext,"");
            let fileData = Fs.readFileSync(asset.path, {encoding:"utf8"});
            if(fileData.indexOf(fileName)!=-1)
            {
                if(fileData.indexOf('"'+fileName+'"')!=-1||fileData.indexOf("'"+fileName+"'")!=-1||
                fileData.indexOf('/'+fileName+'"')!=-1||fileData.indexOf("/"+fileName+"'")!=-1||
                fileData.indexOf('\\'+fileName+'"')!=-1||fileData.indexOf("\\"+fileName+"'")!=-1||
                fileData.indexOf('?:'+fileName+'"')!=-1||fileData.indexOf('?:'+fileName+"'")!=-1)
                {
                    paths.push({path:asset.url.replace("db://assets/",""),uuid:asset.uuid});
                }
            }
        }else
        {
            let jsonPath = asset.destPath;
            if(asset.uuid==uuid)return null;
            let jsonStr = Fs.readFileSync(jsonPath, {encoding:"utf8"});
            if(jsonStr.indexOf(uuid)==-1)return null;
            let jsonData = JSON.parse(jsonStr);
            this.findResources(jsonData,uuid,paths,type);
        }
        return paths.length==0?null:paths;
    },
    findResources(arr,uuid,paths,type)
    {
        let index = 0;
        let res = null;
        let ids = [];
        if(!Array.isArray(arr)) arr = [arr];
        while((res=this.findUUID(arr,uuid,index))!=null)
        {
            index = res.index+1;
            let path = null;
            if(type=="prefab")path = this.findPrefabNodePath(res,arr);
            else if(type=="scene")path = this.findSceneNodePath(res,arr,ids);
            else if(type=="animation-clip")path = this.findAnimationPath(res,arr,uuid);
            //let path = type=="prefab"?this.findPrefabNodePath(res,arr):this.findSceneNodePath(res,arr,ids);
            if(path!=null)paths.push(path);
        }
    },
    findAnimationPath(res,arr,uuid)
    {
        let json = res.json;
        let index = res.index;
        let type = json["__type__"];
        let path = "";
        if(type=="cc.AnimationClip")
        {
            path = json["_name"];
            return {path:path,uuid:path};
        }
    },
    findPrefabNodePath(res,arr)
    {
        let json = res.json;
        let index = res.index;
        let type = json["__type__"];
        let node = null;
        if(type=="cc.Node")node = json;
        else 
        {
            if(json["node"]!=null)
            {
                index = json["node"]["__id__"];
                node = arr[index];
            }else return null;
        }
        var path = "";
        let childPath = "";
        let childID = -1;
        while(node)
        {
            path = node["_name"]+(path.length>0?"/":"")+path;
            let childrens = node["_children"];
            for (let i = 0; i < childrens.length; i++) 
            {
                if(childrens[i]["__id__"]==childID)
                {
                    childPath = i+(childPath.length>0?"/":"")+childPath;
                    break;
                }
            }
            childID = index;
            if(node["_parent"])
            {
                index = node["_parent"]["__id__"];
                node = arr[index];
            }else node = null;
            
        }
        return {path:path,uuid:childPath};
    },
    findSceneNodePath(res,arr,ids)
    {
        let json = res.json;
        let index = res.index;
        let vo = this.isHasSceneRes(json,ids);
        if(vo==null)return null;
        let node = arr[vo["node"]];
        let uuid = node["_id"];
        let path = "";
        while(node)
        {
            if(node["__type__"]=="cc.Scene")break;
            path = node["_name"]+(path.length>0?"/":"")+path;
            if(node["_parent"])
            {
                index = node["_parent"]["__id__"];
                node = arr[index];
            }else node = null;
        }
        return {path:path,uuid:uuid};
    },
    isHasSceneRes(json,arr)
    {
        let type = json["__type__"];
        let nodeId = type=="cc.PrefabInfo"?json["root"]["__id__"]:json["node"]["__id__"];
        for (let i = 0; i < arr.length; i++) 
            if(arr[i]["node"]==nodeId&&arr[i]["type"]==type)return null;
        let o = {type:type,node:nodeId};
        arr.push(o);
        return o;
    },
    findUUID(arr,uuid,index)
    {
        for (let i = index; i < arr.length; i++) 
        {
            let str = JSON.stringify(arr[i]);
            if(str.indexOf(uuid)==-1)continue;
            return {index:i,json:arr[i]};
        }
        return null;
    },
}
// 'cc.Asset': 'native-asset',
// 'cc.AnimationClip': 'animation-clip',
// 'cc.AudioClip': 'audio-clip',
// 'cc.BitmapFont': 'bitmap-font',
// 'cc.CoffeeScript': 'coffeescript',
// 'cc.TypeScript': 'typescript',
// 'cc.JavaScript': 'javascript',
// 'cc.JsonAsset': 'json',
// 'cc.ParticleAsset': 'particle',
// 'cc.Prefab': 'prefab',
// 'cc.SceneAsset': 'scene',
// 'cc.SpriteAtlas': 'sprite-atlas',
// 'cc.SpriteFrame': 'sprite-frame',
// 'cc.Texture2D': 'texture',
// 'cc.TTFFont': 'ttf-font',
// 'cc.TextAsset': 'text',
// 'cc.LabelAtlas': 'label-atlas',
// 'cc.RawAsset': 'raw-asset',
// 'cc.Script': 'script',
// 'cc.Font': 'font',
// 'sp.SkeletonData': 'spine',
// 'cc.TiledMapAsset': 'tiled-map',
// 'dragonBones.DragonBonesAsset': 'dragonbones',
// 'dragonBones.DragonBonesAtlasAsset': 'dragonbones-atlas'
// auto-atlas:自动图集
// sprite-atlas:plist