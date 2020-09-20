

cc.Class({
    extends: Agui.BaseCell,
    properties: {
        bgSprite : cc.Sprite,
        indexLab : cc.Label,
    },

    //更新cell数据
    updateData( idx, data ){
        log.d("updateData", data)
        this.idx = idx
        this.cellData = data
        
        this.indexLab.string = data.name
        if (this.cellData.level == 1) {
            this.indexLab.node.x = 250
        }else if(this.cellData.level == 2) {
            this.indexLab.node.x = 250 + 50
        }else if(this.cellData.level == 3) {
            this.indexLab.node.x = 250 + 100
        }
    },

    //获取cell的size  
    
    getCellSize(idx, cellData){
        var size = this.node.getContentSize()
        return cc.size(size.width, size.height)
    },
});
