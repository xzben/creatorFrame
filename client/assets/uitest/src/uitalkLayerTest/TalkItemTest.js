

cc.Class({
    extends: Agui.BaseCell,
    properties: {
        head : cc.Sprite,
        headFrames : [cc.SpriteFrame],
        bgImg : cc.Node,
        indexLab : cc.Label,
        _isLeft : true,
        isLeft:{
            get () {
                return this._isLeft;
            },
            set (value) {
                this._isLeft = value;
                this.bgImg.scaleX = this.isLeft ? 1 : -1
                this.head.node.x = this.isLeft ? 53 : this.node.width - 53
                this.bgImg.x = this.isLeft ? this.bgImg.width*0.5+100 : this.node.width-this.bgImg.width*0.5-100
                this.indexLab.node.x = this.isLeft ? this.indexLab.node.width*0.5+150 :this.node.width-this.indexLab.node.width*0.5-140 
            },
        },
        _content: "",
        content:{
            multiline: true,
            get () {
                return this._content;
            },
            set (value) {
                this._content = value;
                this.indexLab.string = value;
                this.indexLab.overflow = cc.Label.Overflow.NONE 
                this.indexLab._forceUpdateRenderData(true);
                if (this.indexLab.node.width > 600) {
                    this.indexLab.node.width = 600
                    this.indexLab.overflow = cc.Label.Overflow.RESIZE_HEIGHT
                    this.indexLab._forceUpdateRenderData(true);
                }
                this.node.height = 70 + this.indexLab.node.height
                
                this.bgImg.width = 30 + this.indexLab.node.width + 50
                this.bgImg.height = 30 + this.indexLab.node.height
                this.bgImg.x = this.isLeft ? this.bgImg.width*0.5+100 : this.node.width-this.bgImg.width*0.5-100
                this.bgImg.y = this.node.height-this.bgImg.height*0.5-20
                this.bgImg.scaleX = this.isLeft ? 1 : -1
                
                this.indexLab.node.x = this.isLeft ? this.indexLab.node.width*0.5+150 :this.node.width-this.indexLab.node.width*0.5-140
                this.indexLab.node.y = this.node.height-35-this.indexLab.node.height*0.5
                
                this.head.node.x = this.isLeft ? 53 : this.node.width - 53
                this.head.node.y = this.node.height-8-this.head.node.height*0.5

            },
        },
    },

    //更新cell数据
    updateData( idx, data ){
        this.isLeft = data.isLeft
        this.content = data.content
        this.head.spriteFrame = this.isLeft ? this.headFrames[1] : this.headFrames[0]
    },

    //获取cell的size  
    getCellSize(idx, cellData){
        this.content = cellData.content
        var size = this.node.getContentSize()
        return cc.size(size.width, size.height)
    },
});
