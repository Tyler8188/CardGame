var FS = require('fire-fs');
var path = require('path');
const {remote} = require('electron');

let self = module.exports = {
    cfgData: {
        saveName:null,
        saveImport:null,
        bitMapCfg: [],
        // TODO 图片配置历史
        cfgHistory:{

        }
    },
    setSaveName(name){
        this.cfgData.saveName= name;
        this.saveConfig();
    },
    setSaveImport(path){
      this.cfgData.saveImport=path;
      this.saveConfig();
    },
    setSavePath(savePath) {
        // this.cfgData.savePath = savePath;
        this.saveConfig();
    },
    setBitmapCfg(itemCfg) {
        this.cfgData.bitMapCfg = itemCfg;
    },
    saveConfig() {
        let configFilePath = self._getAppCfgPath();

        FS.writeFile(configFilePath, JSON.stringify(this.cfgData), function (error) {
            if (!error) {
                console.log("保存配置成功!");
            }
        }.bind(this));
    },
    cleanConfig() {
        FS.unlink(this._getAppCfgPath());
    },
    _getAppCfgPath() {
        let userDataPath = remote.app.getPath('userData');
        let tar = Editor.libraryPath;
        tar = tar.replace(/\\/g, '-');
        tar = tar.replace(/:/g, '-');
        tar = tar.replace(/\//g, '-');
        return path.join(userDataPath, "bitmap-font-cfg-" + tar + ".json");
        // return Editor.url('packages://hot-update-tools/save/cfg.json');
    },
    initCfg(cb) {
        let configFilePath = this._getAppCfgPath();
        if (FS.existsSync(configFilePath)) {
            console.log("cfg path: " + configFilePath);
            FS.readFile(configFilePath, 'utf-8', function (err, data) {
                if (!err) {
                    let saveData = JSON.parse(data.toString());
                    self.cfgData = saveData;
                    if (cb) {
                        cb(saveData);
                    }
                }
            }.bind(self));
        } else {
            if (cb) {
                cb(null);
            }
        }
    }
};