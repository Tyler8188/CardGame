'use strict';

module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        'open'() {
            // open entry panel registered in package.json
            Editor.Panel.open('bitmap-font');
        },
        'say-hello'() {
            Editor.log('Hello World!');
            // send ipc message to panel
            Editor.Ipc.sendToPanel('bitmap-font', 'bitmap-font:hello');
        },
        'clicked'() {
            Editor.log('Button clicked!');
        },
        'popup-create-menu'(event, x, y,data) {
            let electron = require('electron');
            let BrowserWindow = electron.BrowserWindow;
            let template = [
                {label: '删除',click(){
                    Editor.Ipc.sendToPanel('bitmap-font', 'bitmap-font:onClickDelChar',data);
                }},
                {type: 'separator'},
                {label: '删除全部',click(){
                    Editor.Ipc.sendToPanel('bitmap-font', 'bitmap-font:onClickDelAllChar',data);
                }},
            ];
            let editorMenu = new Editor.Menu(template, event.sender);

            x = Math.floor(x);
            y = Math.floor(y);
            editorMenu.nativeMenu.popup(BrowserWindow.fromWebContents(event.sender), x, y);
            editorMenu.dispose();
        },
    },
};