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
        this._blockInputNode_ = new cc.Node("_blockInputNode_")
        this._blockInputNode_.parent = this.node
        this._blockInputNode_.zIndex = -1000
        this._blockInputNode_.setContentSize(cc.winSize.width, cc.winSize.height)
        let blockInputEvents = this._blockInputNode_.addComponent(cc.BlockInputEvents)
        blockInputEvents.enabled = true;
    },

    showAnim( doneCallback ){
        this.node.setScale(0.5);
        var action = cc.scaleTo(0.2, 1);
        action.easing(cc.easeElasticOut(0.8));
        this.node.runAction(cc.sequence(action, cc.callFunc(doneCallback)))  
    },

    closeAnim( doneCallback ){
        var action = cc.scaleTo(0.08, 0);
        action.easing(cc.easeElasticIn(0.8));
        this.node.runAction(cc.sequence(action, cc.callFunc(doneCallback))) 
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

