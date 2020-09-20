cc.Class({
    extends: Agui.BaseCell,
    properties: {
        bgSprite : cc.Sprite,
        indexLab : cc.Label,
    },

    handleUpdateActive(isActive){
        this.bgSprite.node.color = isActive ? new cc.Color(255, 0, 0) : new cc.Color(131, 131, 131);
    },

    //更新cell动画显示,子类可以重新这个动画效果
    updateAnim(delay){
        this.node.opacity = 0
        this.node.x = this.node.x - 100
        var action1 = cc.delayTime(delay)
        var moveBy = cc.moveBy(0.2, cc.v2(100, 0))
        var fadeIn = cc.fadeIn(0.2)
        var action2 = cc.spawn(moveBy, fadeIn)
        this.node.runAction(cc.sequence(action1, action2))
    },

    //更新cell数据
    updateData( idx, data ){
        this.indexLab.string = idx
    },

    //获取cell的size  
    getCellSize(idx, cellData){
        var size = this.node.getContentSize()
        return cc.size(size.width, size.height)
    },
});
