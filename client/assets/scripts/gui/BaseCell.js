
var BaseCell = cc.Class({
    extends: cc.Component,
    properties: {
    },

    //更新cell动画显示,子类可以重新这个动画效果
    updateAnim(delay){
        this.node.opacity = 0
        this.node.setScale(1.05)
        var action1 = cc.delayTime(delay)
        var scaleTo = cc.scaleTo(0.1, 1)
        var fadeIn = cc.fadeIn(0.1)
        var action2 = cc.spawn(scaleTo, fadeIn)
        this.node.runAction(cc.sequence(action1, action2))
    },

    handleUpdateAnim(delay){
        this.node.scale = 0
        this.scheduleOnce(()=>{
            this.node.scale = 1
            this.updateAnim(delay)
        }, 0)
    },

    //handle cell 的选中状态的更新，选中状态会由于复用cell节点的问题，所以这里只能用于更新界面的选中状态显示
    // 选中事件使用  handleCellClick
    handleUpdateActive( isActive ){

    },

    // PickerView 中cell的scale 和节点里view中心的的距离相关
    handleUpdateScale( scale ){

    },

    handleUpdateData(coreTable, idx, data){
        this.coreTable = coreTable
        this.updateData(idx, data)
    },

    // handle cell 的点击事件
    handleCellClick(){
        log.d("handle Cell Click");
    },

    //更新cell数据, cellData数据信息
    updateData( idx, cellData ){
        log.d("################# please over write this function updateData()", idx, cellData)
    },

    //获取cell的size, cell重写这个将可以自定义每个cell的大小
    getCellSize(idx, cellData){
        return this.node.getContentSize()
    },
});

module.exports = BaseCell