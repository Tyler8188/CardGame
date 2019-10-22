"use strict";
Vue.component("GameQuickTable", 
{
    template: '\n    '+
    
    '<ui-prop v-prop="target.target"></ui-prop>\n    '+
    '<div v-if="target.target.value.uuid" class="horizontal layout end-justified" style="padding:5px 0;margin-bottom:5px;">\n        '+
    '   <ui-button class="blue tiny" @confirm="resetNodeSize">\n          Resize to Target\n        </ui-button>\n    '+
    '</div>\n    '+
	
	'<ui-prop v-prop="target.tableName"></ui-prop>\n    '+
	'<ui-prop v-prop="target.tableStatus"></ui-prop>\n    '+
	'<ui-prop v-prop="target.countDownTime"></ui-prop>\n    '+
	'<ui-prop v-prop="target.enterGame"></ui-prop>\n    '+
	'<ui-prop v-prop="target.maintainMask"></ui-prop>\n    '+
	'<ui-prop v-prop="target.isboots"></ui-prop>\n    '+
	'<ui-prop v-prop="target.roadMapnode"></ui-prop>\n    '+	
    '<ui-prop v-prop="target.interactable"></ui-prop>\n    '+
    '<ui-prop v-prop="target.enableAutoGrayEffect"></ui-prop>\n    '+
	'<ui-prop v-prop="target.useEvent"></ui-prop>\n    '+
    '<ui-prop v-prop="target.capture" v-if="target.useEvent.value===true"></ui-prop>\n    '+
    '<ui-prop v-prop="target.useClick" v-if="target.useEvent.value===true"></ui-prop>\n    '+
    '<ui-prop v-prop="target.useMouseEvent" v-if="target.useEvent.value===true"></ui-prop>\n    '+
    '<ui-prop v-prop="target.useMouseHand" v-if="target.useEvent.value===true&&target.useMouseEvent.value===true"></ui-prop>\n    '+
    '<ui-prop v-prop="target.useMouseWheel" v-if="target.useEvent.value===true&&target.useMouseEvent.value===true"></ui-prop>\n    '+
    '<ui-prop v-prop="target.useClickAudio" v-if="target.useEvent.value===true&&target.useClick.value===true"></ui-prop>\n    '+
    '<ui-prop v-prop="target.transition"></ui-prop>\n\n    '+
    '<div v-if="target.transition.value === 1">\n      '+
    '   <ui-prop indent=1 v-prop="target.normalColor"></ui-prop>\n      '+
	'   <ui-prop indent=1 v-prop="target.hoverColor"></ui-prop>\n      '+
    '   <ui-prop indent=1 v-prop="target.pressedColor"></ui-prop>\n      '+
    '   <ui-prop indent=1 v-prop="target.disabledColor"></ui-prop>\n      '+
    '   <ui-prop indent=1 v-prop="target.duration"></ui-prop>\n    '+
    '</div>\n\n    '+
    '<div v-if="target.transition.value === 2">\n      '+
    '   <ui-prop indent=1 v-prop="target.normalSprite"></ui-prop>\n      '+
    '   <ui-prop indent=1 v-prop="target.hoverSprite"></ui-prop>\n      '+
    '   <ui-prop indent=1 v-prop="target.pressedSprite"></ui-prop>\n      '+
    '   <ui-prop indent=1 v-prop="target.disabledSprite"></ui-prop>\n    '+
    '</div>\n\n    '+
    '<div v-if="target.transition.value === 3">\n      '+
    '   <ui-prop indent=1 v-prop="target.duration"></ui-prop>\n      '+
    '   <ui-prop indent=1 v-prop="target.zoomScale"></ui-prop>\n    '+
    '</div>\n\n    '+
    '<cc-array-prop :target.sync="target.clickEvents"></cc-array-prop>\n  ',
    props: 
    {
        target: 
        {
            twoWay: !0,
            type: Object
        }
    },
    methods: 
    {
        T: Editor.T,
        resetNodeSize: function() 
        {
            var t = 
            {
                id: this.target.uuid.value,
                path: "_resizeToTarget",
                type: "Boolean",
                isSubProp: !1,
                value: !0
            };
            Editor.Ipc.sendToPanel("scene", "scene:set-property", t)
        }
    }
});