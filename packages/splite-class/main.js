'use strict';
const Fs = require('fs');
const Path = require('path');
const matchKeyworlds = /////  匹配关键词
[
  "export default enum ",
  "export default class ",
  "export default interface ",
  "export default function ",
  "export enum ",
  "export class ",
  "export interface ",
  "export function ",
  "class "
];
const classTypes = 
[
	"class ",
	"enum ",
	"interface ",
	"function "
];
const ignoreFileNames = // 忽略列表
{
	"ShaderLab":true
}

module.exports = 
{
  messages: 
  {
    'openPanel' () 
    {
      var assetsDir = Path.join(Editor.Project.path, "assets/*");
      let adb = Editor.assetdb;
      adb.queryAssets(assetsDir,'typescript',(err,res)=>
      {
        for(let j = 0;j<res.length;j++)
          this.checkScriptContent(res[j]);
        Editor.info("所有Class检测已完成");
      });
    }
  },
  checkScriptContent(item)
  {
    let fileName = this.getFileName(item.url);
    if(fileName==null)return;
    if(fileName.indexOf(".d.ts")!=-1)return;
    let fileData = Fs.readFileSync(item.path, {encoding:"utf8"});
    if(this.isValidScript(fileName,fileData))
    {
      let findData = {t:0,files:[]};
      this.spliteScriptContent(item.path.replace(fileName+".ts",""),fileName,item.path.replace(Editor.Project.path,""),fileData,findData);
      if(findData.t>1)Editor.success("已从脚本 "+fileName+" 中分离出==>"+findData.files.join(","));
    }
  },
  spliteScriptContent(filePath,fileName,dbPath,fileContent,findData)
  {
		if(ignoreFileNames[fileName])return;
		let fileCount = 0;
		let content = null;
		let isFindClassName = false;
		let isNamespace = false;
		let contents = fileContent.split("\n");
		for (let n = 0; n < contents.length; n++) 
		{
			content = contents[n].replace(/\r/g,"");
			for (let m = 0; m < matchKeyworlds.length; m++) 
			{
				let cindex = content.indexOf(matchKeyworlds[m]);
				if(cindex!=-1)
				{
					if(matchKeyworlds[m]=="class "&&content.charAt(cindex-1)!=""&&content.charAt(cindex-1)!=" ")continue;
					fileCount++;
					break;
				}
			}
			if(!isFindClassName)
			{
				for (let o = 0; o < classTypes.length; o++) 
				{
					let ctype = classTypes[o]+fileName;
					let cindex = content.indexOf(ctype);
					if(cindex==-1)continue;
					//Editor.log(cindex,content,content.charAt(cindex+ctype.length)=="",content.charAt(cindex+ctype.length)==" ",content.charAt(cindex-1)=="",content.charAt(cindex-1)==" ")
					let cchar = content.charAt(cindex+ctype.length);
					//Editor.log(cchar,content);
					if((cchar=="{"||cchar==""||cchar==" "||cchar=="<"||cchar=="(")&&(content.charAt(cindex-1)==""||content.charAt(cindex-1)==" "))
					{
						isFindClassName = true;
						break;
					}
				}
			}
			if(content.indexOf("namespace "+fileName)!=-1)isNamespace = true;
		}
		
		if(!isFindClassName)
		{
			if(isNamespace&&fileCount==0)isNamespace = false;
			else Editor.warn("脚本 "+dbPath+" 中未找到与文件名相同的类名！！！");
		}
		if(fileCount<=1)return;// 当前一个文件中只有一个类
	  	let isFind = false;
	  	let braceCount = 0;
	  	let newFileName = null;
		let newFileContents = [];
		let imports = [];
	  
	  
	  for(let i = 0;i<contents.length;i++)
	  {
		  content = contents[i];
		  if(content.indexOf("import ")==0)
		  {
			  imports.push(content);
			  continue;
		  }
		  if(isFind)
		  {
			  let t1 = this.findBraceCount(content,"{");
			  let t2 = this.findBraceCount(content,"}");
			  braceCount+=t1-t2;
			  isFind=braceCount>0;
			  newFileContents.push(content);
			  contents.splice(i,1);
			  i--;
			  if(!isFind)
			  {
				  findData.t++;
				  findData.files.push(newFileName);
				  let sPath = (filePath+newFileName+".ts").replace(Editor.Project.path+"\\","db://");
				  sPath = sPath.replace(/\\/g,"/");
				  newFileContents = imports.concat(newFileContents);
				  //Editor.log(newFileName+"======>"+newFileContents.join("\n"));
				  Editor.assetdb.create(sPath,newFileContents.join("\n"));
			  }
		  }else
		  {
			  for (let j = 0; j < matchKeyworlds.length; j++) 
			  {
				  let world = matchKeyworlds[j];
				  let index = content.indexOf(world);
				  if(index!=-1)
				  {
					  if(content.indexOf(world+fileName)!=-1)continue;// 当前找到的是自己的文件名
					  if(index!=0)
					  {
						  // 先去除文本的左边字符空格
						  content = content.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '');  
						  index = content.indexOf(world);// 再重新查找看关键词位于什么位置
						  if(index!=0)
						  {
							  if(content.indexOf("//")==0)continue;// 这是一个被注释掉的无用的导出类
							  else if(content.charAt(index-1)!=" ")continue;// 这是一个单词里面带有关键词的字符串
						  }
					  }
					  newFileContents = [];
					  braceCount = this.findBraceCount(contents[i],"{");
					  braceCount-= this.findBraceCount(contents[i],"}");
					  content = content.replace(world,"");
					  newFileName = content.split(" ")[0];
					  newFileName = newFileName.replace(/\ +/g,"").replace(/[\r\n]/g,"");
					  newFileName = newFileName.replace(/()/g,"");
					  newFileName = newFileName.replace(/{/g,"");
					  newFileContents.push(contents[i]);
					  contents.splice(i,1);
					  i--;				  
					  isFind = braceCount>0;
					  if(!isFind)
					  {
						  let sPath = (filePath+newFileName+".ts").replace(Editor.Project.path+"\\","db://");
						  sPath = sPath.replace(/\\/g,"/");
						  newFileContents = imports.concat(newFileContents);
						  Editor.assetdb.create(sPath,newFileContents.join("\n"));
						  continue;
					  }
					  let notes = this.findNote(contents,i,newFileName);
					  if(notes.length>0)
					  {
						  newFileContents = notes.concat(newFileContents);
						  for(let k=0;k<notes.length;k++)
						  {
							  contents.splice(i,1);
							  i--;
						  }
					  }
					  break;
				  }
			  }
		  }
	  }
	  fileContent = contents.join("\n");
	  Fs.writeFileSync(filePath+fileName+".ts", fileContent,{encoding:"utf8"});
	  return fileContent;
  },
  
  findNote(arr,index,fName)
  {
	  let notes = [];
	  let isFindNode = false;
	  let tindex = index;
	  while(tindex>=0)
	  {
		  if(!isFindNode&&(index-tindex)>=5)return [];// 在未找到注释的情况下只查看3行代码
		  notes.unshift(arr[tindex]);
		  let noteStr = arr[tindex].replace(/\s*/g,"");
		  if(noteStr.length!=0)
		  {
			  if(noteStr.indexOf("/*")==0)
			  {
				  if(noteStr.indexOf("*/")!=0)return notes;// 在当前行找到结束符号，说明使用/***/方式注释
				  else
				  {
					  if(isFindNode)return notes;
					  else return [];
				  }
			  }else if(noteStr.indexOf("*/")==0)isFindNode = true;
			  else if(!isFindNode)return[];
		  }
		  tindex--;
	  }
	  return notes;
  },
  findBraceCount(str,brace)
  {
	  let index = str.indexOf(brace);
	  if(index==-1)return 0;
	  let count = 0;
	  while(index!=-1)
	  {
		  count++;
		  index = str.indexOf(brace,index+brace.length);
	  }
	  return count;
  },
  isValidScript(fileName,content)
  {
    //if(fileName!="Script1")return false;
    return true;
  },
  getFileName(str)
  {
    let i1 = str.lastIndexOf("/");
    let i2 = str.lastIndexOf(".ts");
    if(i1==-1||i2==-1)return null;
    else return str.substring(i1+1,i2);
  },
};