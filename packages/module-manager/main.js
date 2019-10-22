'use strict';
const setting = require('./settings/Setting');
module.exports = 
{
  load () 
  {
    setting.init();
  },
  unload () 
  {
    setting.save();
  },
  messages: 
  {
    'open' () 
    {
      Editor.Panel.open('module-manager');
    },
    'say-hello' () 
    {
      Editor.log('Hello World!');
      Editor.Ipc.sendToPanel('module-manager', 'module-manager:hello');
    },
    'clicked' () 
    {
      Editor.log('Button clicked!');
    }
  },
};