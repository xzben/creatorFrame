
cc.Node.prototype._setState = function (node, state) {
    for (let i = 0; i < node.childrenCount; ++i) {
        let childNode = node.children[i]
        childNode._setState(childNode, state)
    }

    if (node.getComponent(cc.Button)) {
        node.getComponent(cc.Button).interactable = state != cc.Sprite.State.GRAY
    }

    var sprite = node.getComponent(cc.Sprite)
    if (sprite) {
        if (state == cc.Sprite.State.GRAY){
            sprite.setMaterial(0,cc.MaterialVariant.createWithBuiltin('2d-gray-sprite',sprite));
        }else{
            sprite.setMaterial(0,cc.MaterialVariant.createWithBuiltin('2d-sprite',sprite));
        }       
    }
    else if (node.getComponent(cc.Label)) {
        if (state == cc.Sprite.State.GRAY) {
            node.tempColor = node.color
            var gray = node.tempColor.r * 0.299 + node.tempColor.g * 0.587 + node.tempColor.b * 0.114
            node.color = new cc.Color(gray, gray, gray, node.tempColor.a)
        } else {
            if (!node.tempColor) {
                node.tempColor = node.color
            }
            node.color = new cc.Color(node.tempColor.r, node.tempColor.g, node.tempColor.b, node.tempColor.a)
        }

        var outline = node.getComponent(cc.LabelOutline)
        if (outline) {
            if (state == cc.Sprite.State.GRAY) {
                outline.tempColor = outline.color
                outline.color = new cc.Color(78, 77, 76, outline.tempColor.a)
            } else {
                if (!outline.tempColor) {
                    outline.tempColor = outline.color
                }
                outline.color = new cc.Color(outline.tempColor.r, outline.tempColor.g, outline.tempColor.b, outline.tempColor.a)
            }
        }
    }

}

cc.Node.prototype.setState = function (state) {
    this._setState(this, state || cc.Sprite.State.NORMAL)
}


/*
*查找子节点
*name格式: "menu.item"
*/
cc.Node.prototype.findChild = function(name, typeName){
	var strName = String(name)
	var arr = strName.split(".")
	var parent = this

	for(var i = 0; i < arr.length; i++){
		var curName = arr[i]
		var parent = parent.getChildByName(curName)
		if(parent === null){
			return null;
		}
    }
    
    if (typeName && parent) {
        return parent.getComponent(typeName);
    }
	return parent
}



var BaseNode = cc.Class({
    extends: cc.Component,   
    properties: { 
    },

    ctor(){
        this.m_presenter = null;
    },
    
    setPresenter( presenter ){

        this.m_presenter = presenter;
    },

    handleClose(){
        if(this.m_presenter != null){
            this.m_presenter.close();
        }
    },
    onLoad(){
        log.d("######### BaseNode onLoad", this)
        if(this.m_presenter != null){
            this.m_presenter.onLoad()
        }
    },

    start(){
        log.d("######### BaseNode start", this)
        if(this.m_presenter != null){
            this.m_presenter.start()
        }
    },

    onEnable(){
        log.d("######### BaseNode onEnable", this)
        if(this.m_presenter != null){
            this.m_presenter.onEnable()
        }
    },

    onDisable(){
        log.d("######### BaseNode onDisable", this)
        if(this.m_presenter != null){
            this.m_presenter.onDisable()
        }
    },

    onDestroy(){
        log.d("######### BaseNode onDestroy")
        if(this.m_presenter != null){
            this.m_presenter.onDestroy()
        }
    },

    //添加背景
    setBgColor(alpha){
        if (this._bg_ === null || this._bg_ === undefined) {
            this._bg_ = new cc.Node("_bg_")
            this._bg_.parent = this.node
            this._bg_.zIndex = -100
            this._bg_.setContentSize(cc.winSize.width*2, cc.winSize.height*2)
            var sprite = this._bg_.addComponent(cc.Sprite) 

            game.ResMgr.getInstance().load("images/block", cc.SpriteFrame, (err, spriteFrame)=> {
                sprite.spriteFrame = spriteFrame;
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM
                sprite.spriteFrame = spriteFrame
                this._bg_.setContentSize(cc.winSize.width*2, cc.winSize.height*2)
            });
        }
        var alpha = alpha == undefined ? 180 : alpha
        this._bg_.color = new cc.Color(0, 0, 0)
        this._bg_.opacity = alpha
    },


    //添加子节点
    addChild(node, zOrder){
        if ((node instanceof cc.Node)) {
            this.node.addChild(node, zOrder)
        }else{
            this.node.addChild(node.node, zOrder)
        }
    },

    setParent(newNode){
        if ((newNode instanceof cc.Node)) {
            this.node.setParent(newNode)
        }else{
            this.node.setParent(newNode.node)
        }
    },

    getParent(){
        return this.node.getParent()
    },

    setLocalZOrder(zOrder){
        if (this.node == null) {
            console.log(" setLocalZOrder node is null!")
        }
        this.node.zIndex = zOrder;
    },

    getLocalZOrder(zOrder){
        return this.node.zIndex;
    },

    //设置隐藏
    setVisible(visible){
        this.node.active = visible ? visible : false;
    },

    setPosition(pos){
        if (this.node && this.node.position) {
            this.node.position = pos != undefined ? pos : cc.v2(0,0)
        }
    },

    setPositionX(x){
        this.node.x = x
    },

    setPositionY(y){
        this.node.y = y
    },

    setAnchorPoint(anchorPoint){
        this.node.setAnchorPoint(anchorPoint)
    },

    getAnchorPoint(){
        return this.node.getAnchorPoint()
    },

    setVisible(visible){
        this.node.active = visible
    },

    isVisible(){
        return this.node.active
    },

    setColor(color){
        if (color) {
            this.node.color = color
        }
    },

    getColor(){
        return this.node.color
    },

    setContentSize(size){
        this.node.setContentSize(size)
    },

    getContentSize(){
        return this.node.getContentSize()
    },

    setScale(scale){
        this.node.scale = scale
    },

    getScale(){
        return this.node.scale
    },

    setScaleX(scaleX){
        this.node.scaleX = scaleX
    },

    setScaleY(scaleY){
        this.node.scaleY = scaleY
    },

    setOpacity(opacity){
        this.node.opacity = opacity
    },

    getOpacity(){
        return this.node.opacity
    },

    setRotation(rotation){
        this.node.rotation = rotation
    },

    getRotation(){
        return this.node.rotation
    },

    getChildren(){
        return this.node.children
    },

    getChildrenCount(){
        return this.node.childrenCount
    },

    getChildByName(name){
        return this.node.getChildByName(name)
    },

    sortAllChildren(){
        this.node.sortAllChildren()
    },

    isValid(){
        return this.node.isValid && cc.isValid(this.node, true)
    },

    runAction(action){
        this.node.runAction(action)
    },

    getActionByTag(tag){
        this.node.getActionByTag(tag)
    },

    stopAction(action){
        this.node.stopAction(action)
    },

    stopActionByTag(tag){
        this.node.stopActionByTag(tag)
    },

    stopAllActions(){
        this.node.stopAllActions()
    },

    convertToNodeSpace(pos){
        return this.node.convertToNodeSpace(pos)
    },

    convertToWorldSpace(pos){
        return this.node.convertToWorldSpace(pos)
    },

    convertToNodeSpaceAR(pos){
        return this.node.convertToNodeSpaceAR(pos)
    },

    convertToWorldSpaceAR(pos){
        return this.node.convertToWorldSpaceAR(pos)
    },

    convertTouchToNodeSpace(touch){
        return this.node.convertTouchToNodeSpace(touch)
    },

    removeFromParent(){
        this.node.destroy()
    },

    removeAllChildren(){
        this.node.removeAllChildren()
    },
    
});

module.exports = BaseNode;

