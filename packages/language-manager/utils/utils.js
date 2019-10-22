let Fs = require("fire-fs");
let Path = require('fire-path');

module.exports = 
{
    findLanguageFiles(str)
    {
        let languages = [];
        let files = Fs.readdirSync(str);  
        for (let i = 0; i < files.length; i++) 
        {
            let ele = files[i];
            let info = Fs.statSync(str+"/"+ele);
            if(!info.isDirectory())
            {
                if(Path.extname(ele)!=".json")continue;
                let json = Fs.readJsonSync(str+"/"+ele);
                if(json==null)continue;
                languages.push({name:Path.basenameNoExt(ele),path:str+"/"+ele,json:json})
            }else languages = languages.concat(this.findLanguageFiles(str+"/"+ele));
        }
        return languages;
    },
    parseLanguageDatas(arr)
    {
        let dict = {};
        let datas = [];
        for (let i = 0; i < arr.length; i++) 
        {
            if(arr[i].json==null)continue;
            let json = arr[i].json;
            let file = arr[i].name;
            for (const key in json) 
            {
                if(dict[key]==null)
                {
                    dict[key] = this.fillArrayData(key,arr);
                    dict[key][0].value = key;
                    datas.push(dict[key]);
                }
                dict[key][i+1].file = file;
                dict[key][i+1].key = key;
                dict[key][i+1].value = json[key];
            }
        }
        return datas;
    },
    fillArrayData(key,names)
    {
        let arr = [];
        for (let i = 0; i < names.length; i++) 
            arr.push({file:names[i].name,key:key,value:""});
        arr.unshift({file:"",key:key,value:""});
        return arr;
    },
    addNewLanguageData(temps,languages)
    {
        let keys = [];
        for (let i = 0; i < temps.length; i++) 
        {
            if(temps[i].length==0)continue;
            keys.push(temps[i][0].key);
        }
        for (let j = 0; j < Number.MAX_VALUE; j++) 
        {
            let key = "Text_Language"+j;
            if(keys.indexOf(key)==-1)
            {
                let arr = [];
                for (let k = 0; k < languages.length; k++) 
                {
                    let l = languages[k];
                    let o = {file:"",key:key,value:""};
                    if(l.path==null||l.path=="")o.value = key;
                    else o.file = l.name;
                    arr.push(o);
                }
                temps.push(arr);
                return true;
            }
        }
        return false;
    }
}