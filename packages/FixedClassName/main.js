'use strict';
const Fs = require('fs');
const Path = require('path');
var Ignores = // 忽略列表
{
    files:["Cryptogram","PacketRuler","Common","Assets","FBinder","FDispose","FMediator","FModule","FObject","FScene","FStore","FViewModule","FView","ShaderLab"],// 需要忽略的文件
    containNames:["Utility","Manager","C_","S_"],// 需要忽略包含的文件名字符
    extendClass:["FScene"] // 需要忽略继承了指定类的文件
}
module.exports = 
{
  messages: {
    'openPanel' () 
    {
      var assetsDir = Path.join(Editor.Project.path, "assets/*");
      let adb = Editor.assetdb;
      adb.queryAssets(assetsDir,'typescript',(err,res)=>
      {
        for(let j = 0;j<res.length;j++)
          this.checkScriptContent(res[j]);
        Editor.log("ClassName检测已完成");
      });
    }
  },
  checkScriptContent(item)
  {
    let fileName = this.getFileName(item.url);
    if(fileName==null)return;
    let fileData = Fs.readFileSync(item.path, {encoding:"utf8"});
    if(this.isIgnore(fileName,fileData))return;// 在忽略列表中的文件
    if(this.isDescription(fileName,fileData))return;// TS描述文件
	  if(this.isNameSpace(fileName,fileData))return;// 命名空间类型
	  if(this.isEnum(fileName,fileData))return;// 枚举类型
    if(this.isInterface(fileName,fileData))return;// 接口不用加ClassName属性
    if(this.isGlobalFun(fileName,fileData))return;// 全局方法不用加ClassName属性
    if(this.isHasClassName(fileName,fileData))return;// 已经存在ClassName属性了
    fileData = this.addScriptClassName(fileName,fileData);
    this.saveScript(fileName,fileData,item);
  },
  saveScript(fileName,fileData,data)
  {
    Fs.writeFileSync(data.path, fileData,{encoding:"utf8"});
    Editor.log("新增ClassName文件===>",fileName);
  },
  addScriptClassName(fileName,fileData)
  {
    let str = "class "+fileName;
    let i1 = fileData.indexOf(str);
    i1 = fileData.indexOf("{",i1);
    let str1 = fileData.substring(0,i1+1);
    let str2 = fileData.substr(i1+1);
    str1+='\r\n    public static ClassName:string = "'+fileName+'";';
    return str1+str2;
  },
  getFileName(str)
  {
    let i1 = str.lastIndexOf("/");
    let i2 = str.lastIndexOf(".ts");
    if(i1==-1||i2==-1)return null;
    else return str.substring(i1+1,i2);
  },
  isIgnore(fileName,content)
  {
    if(Ignores.files.indexOf(fileName)!=-1)return true;
    for (let i = 0; i < Ignores.containNames.length; i++) 
    {
      if(fileName.indexOf(Ignores.containNames[i])!=-1)
        return true;
    }
    for (let j = 0; j < Ignores.extendClass.length; j++) 
    {
      if(content.indexOf("class "+fileName+" extends "+Ignores.extendClass[j])!=-1)
        return true;
    }
    return false;
  },
  isDescription(fileName,content)
  {
    return fileName.indexOf(".d")!=-1;
  },
  isNameSpace(fileName,content)
  {
	let str = "namespace "+fileName;
    return content.indexOf(str)!=-1;
  },
  isEnum(fileName,content)
  {
	let str = "enum "+fileName;
    return content.indexOf(str)!=-1;
  },
  isInterface(fileName,content)
  {
    let str = "interface "+fileName;
    return content.indexOf(str)!=-1;
  },
  isGlobalFun(fileName,content)
  {
    let str1 = "export function "+fileName;
    if(content.indexOf(str1)!=-1)return true;
    let str2 = "export default function "+fileName;
    return content.indexOf(str2)!=-1;
  },
  isHasClassName(fileName,content)
  {
    let str = content.replace(/\ +/g,"").replace(/[\r\n]/g,"");
    return str.indexOf('publicstaticClassName:string="'+fileName+'"')!=-1;
  },
};