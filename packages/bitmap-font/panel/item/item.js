let fs = require('fire-fs');
let packageName = "bitmap-font";
let CfgUtil = Editor.require("packages://bitmap-font/core/CfgUtil");

module.exports = {
    init() {
        console.log("char-item 注册组件!");
        Vue.component('char-item', {
            props: ['data', 'index'],
            template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/item/item.html', 'utf8')) + "",
            created() {
                this.$nextTick(function () {
                    this.onInputChar();
                    this.onMouseOut();
                })
            },
            methods: {
                onMenu(event) {
                    Editor.Ipc.sendToMain('bitmap-font:popup-create-menu', event.x, event.y, this.data);
                    console.log("on right mouse menu: " + this.data.image);
                },
                onMouseOver() {
                    this.$el.style.backgroundColor = '#777';
                },
                onMouseOut() {
                    let bgColor = '#333';
                    if (this.index % 2) {
                        bgColor = '#333';
                    } else {
                        bgColor = '#444';
                    }
                    this.$el.style.backgroundColor = bgColor;
                },
                onInputChar() {
                    let charBg = this.$el.getElementsByClassName("charBg")[0];
                    if (charBg) {

                        let isRepeat = false;
                        if (this.data.char) {
                            isRepeat = window.plugin.checkIsContentRepeatChar(this.data.char);
                            if (isRepeat) {
                                this.data.char = null;
                            }
                        }

                        if (this.data.char === null || this.data.char === "" || isRepeat === true) {
                            charBg.style.backgroundColor = "#ff342e";
                            let charInput = this.$el.getElementsByClassName("charInput")[0];
                            if (charInput) {
                                // charInput.focus();
                            }
                        } else {
                            if (this.data.char.length > 1) {
                                this.data.char = this.data.char[0];
                            }
                            charBg.style.backgroundColor = this.$el.style.backgroundColor;
                        }
                    }
                    CfgUtil.saveConfig();
                },
                onClickBtnDel(event) {
                    window.plugin.delCharCfg(this.data);
                },
            },
            computed: {},
        });
    }
};