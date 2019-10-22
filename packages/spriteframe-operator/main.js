'use strict';

module.exports = 
{
  load () 
  {
  },
  unload () 
  {
  },
  messages: 
  {
    'open' () 
    {
      // open entry panel registered in package.json
      // Editor.Scene.callSceneScript('resource-manager', 'import-label-string', function (err) {});
      Editor.Panel.open('spriteframe-operator');
    }
  },
};