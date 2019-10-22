let packageName = "bitmap-font";

let fs = require("fire-fs");
let path = require("fire-path");
var Electron = require('electron');
var CfgUtil = Editor.require("packages://bitmap-font/core/CfgUtil");
let charItem = Editor.require('packages://' + packageName + '/panel/item/item.js');
Editor.Panel.extend({

    style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",


    $: {
        logTextArea: '#logTextArea',
        view: '#view',
        container: '#container',
        section: '#section'
    },

    ready() {
        let logCtrl = this.$logTextArea;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };
        let view = this.$view;
        let container = this.$container;
        let section = this.$section;
        let resizeScroll = function () {
            if (container && view && container.scrollHeight < view.clientHeight) {
                section.style.height = (view.clientHeight - 30) + 'px';
                container.style.height = (view.clientHeight - 15) + 'px';
            }
        };
        // 注册自定义组件
        charItem.init();
        window.addEventListener('resize', function () {
            resizeScroll();
        });
        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                console.log("created");
                // this._initTestData();
                this._initPlugin();
                resizeScroll();
            },
            init() {
                console.log("init");
            },
            data: {
                uuid: null,
                logView: [],
                fileSavePath: null,
                fileSaveName: null,
                fileImportPath: null,
                charDataArray: [
                    /*   {
                           image: 'C:/project/client/cargame/packages/bitmap-font/image/3.png',
                           imageWidth: 0,
                           imageHeight: 0,
                           char: '3',
                       },
                    */
                ],
                cfgArray: ["fsfsfe"],
            },
            methods: {
                onAddCfg() {
                    this.cfgArray.push("32132423");
                },
                onCfgSelectChange(event, a, b) {
                    let value = event.currentTarget.value;
                    if (value === "添加新配置") {

                    }
                    console.log("onCfgSelectChange:" + value);
                },
                onBtnClickTest() {
                    console.log("onBtnClickTest");
                    let indexJS = path.join(Editor.projectInfo.path, "packages/bitmap-font/panel/index.js");
                    let indexJSMin = path.join(Editor.projectInfo.path, "packages/bitmap-font/panel/index.min.js");

                    if (!fs.existsSync(indexJS)) {
                        this._addLog("文件不存在: " + indexJS);
                        return;
                    }
                    let files = fs.readFileSync(indexJS, 'utf-8');
                    // let JsMin = Editor.require("packages://bitmap-font/node_modules/jsmin");
                    // let result = JsMin.jsmin(files);
                    // console.log(result);
                    // this._addLog(result);
                    // fs.writeFileSync(indexJSMin, result);

                    let uglify = Editor.require("packages://bitmap-font/node_modules/uglify-es");
                    let result = uglify.minify(files);
                    if (result.error) {
                        console.log("[%s]:%d-%d %s", result.error.filename, result.error.line, result.error.col, result.error.message);
                        this._addLog("生成压缩代码失败");
                    } else {
                        console.log(result.code);
                        this._addLog(result.code);
                        fs.writeFileSync(indexJSMin, result.code);
                    }
                },
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                delAllCharCfg() {
                    this.charDataArray.splice(0, this.charDataArray.length);
                    CfgUtil.saveConfig();
                    this._addLog('清空配置成功!');
                },
                delCharCfg(itemCfg) {
                    if (!itemCfg) {
                        this._addLog("删除失败");
                        return;
                    }
                    let b = false;
                    for (let i = 0; i < this.charDataArray.length; i++) {
                        let item = this.charDataArray[i];
                        if (item.image === itemCfg.image &&
                            item.imageWidth === itemCfg.imageWidth &&
                            item.imageHeight === itemCfg.imageHeight) {
                            this.charDataArray.splice(i, 1);
                            this._addLog("del: " + item.image);
                            b = true;
                        }
                    }
                    if (b) {
                        CfgUtil.saveConfig();
                    }
                },

                _initTestData() {
                    this._addImage('C:/project/client/cargame/packages/bitmap-font/image/3.png', '3');
                    this._addImage('C:/project/client/cargame/packages/bitmap-font/image/0.png', '0');
                },
                _initPlugin() {
                    CfgUtil.initCfg(function (data) {
                        //  默认一个bitmap临时存放目录
                        this._initTmpDir();
                        if (data) {
                            this.fileSaveName = data.saveName;
                            this.fileImportPath = data.saveImport;
                            this.charDataArray = data.bitMapCfg || [];
                            this.charDataArray.sort(function (a, b) {
                                let pathA = a.image;
                                let pathB = b.image;
                                let extA = path.basename(pathA);
                                let extB = path.basename(pathB);
                                let numA = extA.charCodeAt(0);
                                let numB = extB.charCodeAt(0);
                                return numA - numB;
                            });
                        }
                    }.bind(this));
                },
                _initTmpDir() {
                    let userPath = Electron.remote.app.getPath('userData');
                    let tempDir = path.join(userPath, "/bitmap-font");// 临时目录
                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir);
                    }
                    this.fileSavePath = tempDir;
                },
                // todo 测试窗口改变的时候,改变div尺寸
                onWinResize() {
                    this.$nextTick(function () {
                        let arr = this.$el.ownerDocument.getElementsByClassName('fit');
                        let bitmap = arr.namedItem('bitmap-font');
                        if (bitmap) {
                            bitmap.onresize = function () {
                                console.log('on win resize');
                            }
                        }
                    });
                },
                onClickOpen() {
                    if (this.fileSavePath) {
                        Electron.shell.showItemInFolder(this.fileSavePath);
                        Electron.shell.beep();
                    }
                },
                onClickSelect() {
                    let res = Editor.Dialog.openFile({
                        title: "选择保存目录",
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        this.fileSavePath = dir;
                        CfgUtil.setSavePath(dir);
                    }
                },
                onUpdateSaveName(event) {
                    if (this.fileSaveName) {
                        let reg = new RegExp('^[^\\\\\\/:*?\\"<>|]+$');
                        if (reg.test(this.fileSaveName)) {
                            if (this.fileSaveName.indexOf('.') !== -1) {
                                let arr = this.fileSaveName.split('.');
                                this._addLog(this.fileSaveName + "不需要包含扩展名,已经自动修改为:" + arr[0]);
                                this.fileSaveName = arr[0];
                            }
                            CfgUtil.setSaveName(this.fileSaveName);
                        } else {
                            this._addLog("文件名不符合规则:" + this.fileSaveName);
                            this.fileSaveName = "";
                        }
                    } else if (this.fileSaveName.length === 0) {
                        this._addLog("保存文件名不能为空");
                    }
                },
                // 选择导入的地方
                onSelectImportPath() {
                    let res = Editor.Dialog.openFile({
                        title: "选择导出目录",
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        let dir2 = Editor.assetdb.remote.fspathToUrl(dir);
                        // let b = Editor.assetdb.remote.isSubAssetByPath(dir2);
                        if (dir2.indexOf("db://") === -1) {
                            this._addLog("不是项目资源目录:" + dir);
                            this.fileImportPath = "";
                        } else {
                            this.fileImportPath = dir2;
                            CfgUtil.setSaveImport(dir2);
                        }
                    }
                },

                onGenAndImportFont() {
                    // 逆向索引出文件名
                    Editor.assetdb.queryInfoByUuid(this.uuid, function (err, info) {
                        if (err) {
                            this._addLog(err);
                        } else {
                            let fontPath = info.path;
                            let fontDir = path.dirname(fontPath);
                            let fontName = path.basename(fontPath, '.fnt');
                            this.onGen(fontName, function () {
                                this._addLog("导入bitmap-font到项目!");
                                let url = Editor.assetdb.remote.fspathToUrl(fontDir);
                                setTimeout(function () {
                                    this.onImport(fontName, url);
                                }.bind(this), 500);
                            }.bind(this));
                        }
                    }.bind(this));
                },
                onImportFont() {
                    this.onImport(this.fileSaveName, this.fileImportPath);
                },
                onImport(fileSaveName, fileImportPath) {
                    if (!fileImportPath) {
                        this._addLog("导出目录错误:" + fileImportPath);
                        return;
                    }

                    let fontPng = path.join(this.fileSavePath, fileSaveName + ".png");
                    if (!fs.existsSync(fontPng)) {
                        this._addLog("fnt图片文件不存在:" + fontPng);
                        return;
                    }

                    let fontFile = path.join(this.fileSavePath, fileSaveName + ".fnt");
                    if (!fs.existsSync(fontFile)) {
                        this._addLog("fnt字体文件不存在:" + fontFile);
                        return;
                    }

                    let pngUrl = fileImportPath + "/" + fileSaveName + ".png";
                    let fontUrl = fileImportPath + "/" + fileSaveName + ".fnt";
                    // Editor.assetdb.delete([pngUrl, fontUrl]);
                    Editor.assetdb.import([fontPng, fontFile], fileImportPath, true,
                        function (err, results) {
                            this._addLog("导入成功!");
                            Editor.assetdb.refresh(fileImportPath);
                            results.forEach(function (result, cur, total) {
                                // console.log(result.path);
                                // result.uuid
                                // result.parentUuid
                                // result.url
                                // result.path
                                // result.type
                            });
                        }.bind(this));
                },
                onGen(fileSaveName, callBack) {
                    if (this.fileSavePath && fs.existsSync(this.fileSavePath)) {
                    } else {
                        this._addLog("文件保存目录不存在: " + this.fileSavePath);
                        return;
                    }
                    let unSetChar = this._checkAllCharValueIsSet();
                    if (unSetChar) {
                        this._addLog("该图片没有设置字符: " + unSetChar.image);
                        return;
                    }


                    if (this.charDataArray.length <= 0) {
                        this._addLog("请导入图片!");
                        return;
                    }

                    let sprites = [];
                    for (let i = 0; i < this.charDataArray.length; i++) {
                        sprites.push(this.charDataArray[i].image);
                    }
                    this._addLog("生成中...");
                    let SpriteSmith = Editor.require("packages://bitmap-font/node_modules/spritesmith");
                    SpriteSmith.run(
                        {src: sprites, algorithm: 'left-right'},
                        function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                let outPutFilePath = path.join(this.fileSavePath, fileSaveName + ".png");
                                fs.writeFileSync(outPutFilePath, result.image);
                                // 得到配置之后生成font字体
                                /*
                                *   info face="微软雅黑" size=32 bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=1,1 outline=0
                                    common lineHeight=32 base=26 scaleW=256 scaleH=256 pages=1 packed=0 alphaChnl=1 redChnl=0 greenChnl=0 blueChnl=0
                                    page id=0 file="2_0.png"
                                    chars count=3
                                    char id=49   x=19    y=0     width=14    height=23    xoffset=0     yoffset=0     xadvance=14    page=0  chnl=15
                                    char id=50   x=0     y=0     width=18    height=23    xoffset=0     yoffset=0     xadvance=18    page=0  chnl=15
                                    char id=51   x=34    y=0     width=19    height=20    xoffset=0     yoffset=0     xadvance=19    page=0  chnl=15
                                * */
                                let util = require('util');

                                let infoCfg = "info face=\"微软雅黑\" size=40 bold=0 italic=0 charset=\"\" unicode=1 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=1,1 outline=0\n";
                                let commonCfg = util.format("common lineHeight=40 base=26 scaleW=%d scaleH=%d pages=1 packed=0 alphaChnl=1 redChnl=0 greenChnl=0 blueChnl=0\n",
                                    result.properties.width, result.properties.height);

                                let pageCfg = util.format("page id=0 file=\"%s.png\"\n", fileSaveName);
                                // 字符数量配置
                                let charsCfg = util.format("chars count=%d\n", this.charDataArray.length);
                                let charArrCfg = "";
                                // 字符串配置
                                for (let k in result.coordinates) {
                                    let itemCharCfg = this._setCharData(k, result.coordinates[k]);
                                    if (itemCharCfg) {
                                        charArrCfg += itemCharCfg;
                                    } else {
                                        this._addLog("该图片没有设置字符: " + k);
                                        this._addLog("生成font字体失败!");
                                        return;
                                    }
                                }

                                let cfg = infoCfg + commonCfg + pageCfg + charsCfg + charArrCfg;
                                // console.log("生成的配置:\n" + cfg);
                                let savePath = path.join(this.fileSavePath, fileSaveName + ".fnt");
                                fs.writeFileSync(savePath, cfg);
                                this._addLog("生成成功, 文件保存在:" + savePath);
                                if (callBack) {
                                    callBack();
                                }
                            }
                        }.bind(this));
                },

                onClickGen() {
                    this.onGen(this.fileSaveName);
                    /*
                    // 高度要一致,宽度可以不用一致
                    let imgFileLen = this.charDataArray.length;

                    if (imgFileLen > 1) {
                        let sharp = require(Editor.url('unpack://utils/sharp'));

                        // 检索出总宽度和高度
                        let pngWidth = 0;
                        let pngHeight = this.charDataArray[0].imageHeight;
                        for (let i = 0; i < imgFileLen; i++) {
                            let item = this.charDataArray[i];
                            pngWidth += item.imageWidth;

                            if (item.imageHeight > pngHeight) {
                                pngHeight = item.imageHeight;
                            }
                        }


                        let canvas = document.createElement('canvas');
                        canvas.width = pngWidth;
                        canvas.height = pngHeight;
                        let ctx = canvas.getContext('2d');
                        ctx.rect(0,0,pngWidth,pngHeight);
                        ctx.fillStyle='transparent';
                        ctx.fill();
                        let drawX = 0;
                        function drawing(index) {
                            if (index < this.charDataArray.length) {
                                let itemData = this.charDataArray[index];
                                let drawImg = new Image();
                                drawImg.src = itemData.image;
                                drawImg.onload = function () {
                                    ctx.drawImage(drawImg, drawX, 0, itemData.imageWidth, itemData.imageHeight);
                                    drawing(index + 1);
                                };
                            } else {

                            }
                        }
                        drawing(0);
                        return;


                        // 先创建好需要大小的尺寸图片
                        let image1 = this.charDataArray[0].image;
                        let buffer = Buffer.alloc(pngWidth * pngHeight * 4, 0);
                        let img = sharp(buffer, {
                            create: {
                                width: pngWidth,
                                height: pngHeight,
                                channels: 4,
                                background: {r: 0, g: 0, b: 0, alpha: 0}
                            }
                        });
                        img.background({r: 0, g: 0, b: 0, alpha: 0});
                        // .extract({left: 0, top: 0, width: 10, height:10})
                        img.extend({top: 0, left: 0, bottom: pngHeight, right: pngWidth});

                        // 将所有图片扩展到height的尺寸
                        // 混合图片
                        for (let i = 1; i < imgFileLen; i++) {
                            let itemFileData = this.charDataArray[i];
                            img.overlayWith(itemFileData.image, {left: itemFileData.imageWidth, top: 0});
                        }

                        // 输出保存
                        let filePath = path.join(this.fileSavePath, "/out.png");
                        img.toFile(filePath, function (err, info) {
                            if (err) {
                                console.log("error :" + err);
                            } else {
                                console.log("生成成功!");
                            }
                        });

                    }
                    */
                },
                // 检查字符是否设置
                _checkAllCharValueIsSet() {
                    for (let i = 0; i < this.charDataArray.length; i++) {
                        let item = this.charDataArray[i];
                        if (item.char === null) {
                            return item;
                        } else if (item.char === "") {
                            return item;
                        }
                    }
                    return null;
                },
                checkIsContentRepeatChar(char) {
                    let repeatChar = [];
                    for (let i = 0; i < this.charDataArray.length; i++) {
                        let item = this.charDataArray[i];
                        if (item.char === char) {
                            repeatChar.push(item);
                        }
                    }
                    if (repeatChar.length > 1) {
                        let util = require('util');
                        let str = util.format("发现多张图片对应同一个字符[%s] :\n", char);
                        for (let j = 0; j < repeatChar.length; j++) {
                            str += repeatChar[j].image + "\n";
                        }
                        this._addLog(str);
                        return true;
                    } else {
                        return false;
                    }
                },
                _setCharData(png, coordinateData) {
                    let util = require('util');
                    let char = null;
                    for (let i = 0; i < this.charDataArray.length; i++) {
                        let item = this.charDataArray[i];
                        if (item.image === png) {
                            char = item.char;
                            break;
                        }
                    }
                    if (char && char.length === 1) {
                        let charId = char.charCodeAt(0);
                        let charStr = util.format("char id=%d   x=%d    y=%d     width=%d    height=%d    xoffset=0     yoffset=0     xadvance=%d    page=0  chnl=15\n",
                            charId, coordinateData.x, coordinateData.y, coordinateData.width, coordinateData.height, coordinateData.width);
                        return charStr;
                    } else {
                        this._addLog("没有发现字符");
                        return null;
                    }
                },
                drop(event) {
                    event.preventDefault();
                    console.log("drop");
                    for (let i = 0; i < event.dataTransfer.files.length; i++) {
                        let file = event.dataTransfer.files[i];
                        let filePath = file.path;
                        if (file.type === "image/png") {
                            // 判断是否有重复的图片
                            if (this._isSameFileExist(filePath)) {
                                this._addLog("已经存在该图片: " + filePath);
                            } else {
                                this._addImage(filePath, null);
                            }
                        } else {
                            this._addLog("只能识别图片: " + filePath);
                        }
                    }
                    CfgUtil.saveConfig();
                    return false;
                },
                _addImage(filePath, char) {
                    let imageSize = require(Editor.url("packages://bitmap-font/node_modules/image-size"));
                    let size = imageSize(filePath);
                    let item = {
                        image: filePath,
                        char: char,
                        imageWidth: size.width,
                        imageHeight: size.height
                    };
                    this.charDataArray.push(item);
                    //   排序,按照字母数字排序
                    this.charDataArray.sort(function (a, b) {
                        let pathA = a.image;
                        let pathB = b.image;
                        let extA = path.basename(pathA);
                        let extB = path.basename(pathB);
                        let numA = extA.charCodeAt(0);
                        let numB = extB.charCodeAt(0);
                        return numA - numB;
                    });
                    CfgUtil.setBitmapCfg(this.charDataArray);
                },
                _isSameFileExist(file) {
                    let b = false;
                    for (let i = 0; i < this.charDataArray.length; i++) {
                        if (this.charDataArray[i].image === file) {
                            b = true;
                            break;
                        }
                    }
                    return b;
                },
                dragOver(event) {
                    // 只有这个控制是否有效
                    event.preventDefault();
                    event.stopPropagation();
                    // console.log("dragOver");
                },
                dragEnter(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    // console.log("dragEnter");
                },
                dragLeave(event) {
                    event.preventDefault();
                    // console.log("dragLeave");
                },
            }
        });


    },

    // register your ipc messages here
    messages: {
        'bitmap-font:onClickDelChar'(event, data) {
            window.plugin.delCharCfg(data);
        },
        'bitmap-font:onClickDelAllChar'(event, data) {
            window.plugin.delAllCharCfg(data);
        },
    }
});