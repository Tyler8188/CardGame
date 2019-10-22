let fs = require('fire-fs');
const Path = require('path');
let packageName = "module-manager";

const PATH = 'packages://' + packageName + '/settings/setting.json';
let profile = null;

module.exports = {
    init()
    {
        if(!window.modulemanager)
        {
            if(fs.existsSync(Editor.url(PATH, 'utf8')))
            {
                let profileStr = fs.readFileSync(Editor.url(PATH, 'utf8')) + "";
                profile = JSON.parse(profileStr);
            }else profile = {moduleFilePath:"",coreFilePath:""};
            window.modulemanager = profile;
        }else profile = window.modulemanager;
    },
    save()
    {
        fs.writeFileSync(Editor.url(PATH, 'utf8'),JSON.stringify(profile));
    },
    profile()
    {
        return profile;
    }
}
