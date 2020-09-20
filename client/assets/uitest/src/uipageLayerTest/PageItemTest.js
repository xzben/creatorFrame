

cc.Class({
    extends: Agui.BaseCell,
    properties: {
        bgSprite : cc.Sprite,
        indexLab : cc.Label,
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
