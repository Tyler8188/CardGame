let packageName = "language-manager";
let Fs = require('fire-fs');
const Path = require('path');
const PATH = 'packages://' + packageName + '/setting/setting.json';
module.exports = 
{
    init()
    {
        if(!window[PATH])
        {
            if(Fs.existsSync(Editor.url(PATH, 'utf8')))
            {
                window[PATH] = Fs.readJsonSync(Editor.url(PATH, 'utf8'));
            }else window[PATH] = {rootPath:""};
        }
    },
    save()
    {
        Fs.writeFileSync(Editor.url(PATH, 'utf8'),JSON.stringify(window[PATH]));
    },
    profile()
    {
        return window[PATH];
    }
}