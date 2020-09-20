

cc.Class({
    extends: Agui.BaseCell,
    properties: {
        bgSprite : cc.Sprite,
        indexLab : cc.Label,
    },

    handleUpdateScale( scale ){
        this.bgSprite.node.setScale(scale)
        this.bgSprite.node.opacity = scale * scale * 255
        this.indexLab.node.setScale(scale)
        this.indexLab.node.opacity = scale * scale * 255
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
