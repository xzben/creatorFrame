var BaseNode = require("BaseNode")
var BaseView = cc.Class({
    extends: BaseNode,   
    properties: { 
    },

    ctor(){
        this.m_closeCallbacK = null; //关闭回调
    },

    onLoad(){
        this._super()
        this.checkSetBlockInput();
        // console.log("==========BaseView onLoad===========");  
    },

    checkSetBlockInput(){
        this.blockInputEvents = this.getComponent(cc.BlockInputEvents)
        if (this.blockInputEvents == null) {
            this.blockInputEvents = this.addComponent(cc.BlockInputEvents)
            this.blockInputEvents.enabled = true;
        }
    },

    start(){
        this._super()
        // console.log("==========BaseView start===========");
    },

    onDestroy(){
        // console.log("==========BaseView onDestroy===========");
        this._super()
        this.m_closeCallbacK && this.m_closeCallbacK()
    },

    //设置关闭的回调
    setCloseCallbacK(closeCallbacK){
        this.m_closeCallbacK = closeCallbacK
    },

});

module.exports = BaseView;

