

//滑动方向
var DirectType = cc.Enum({
    VERTICAL : 0,    //垂直
    HORIZONTAL : 1,  //水平
})

//垂直方向的填充数据顺序
var VerticalFillOrder = cc.Enum({
    TOP_DOWN : 0,  //从上往下
    BOTTOM_UP : 1, //从下往上
})

//对齐方式
var Alignment = cc.Enum({
    LEFT_TOP : 0,  //左或者上
    MIDDLE : 1, //居中
    RIGHT_BOTTOM : 2, //右或者下
})

//重复回收利用的列表视图
var TableView = cc.Class({
    extends: cc.ScrollView,
    properties: {
        vertical: {
            default: true,
            animatable: false,
            visible: false,
            override: true,
        },
        horizontal: {
            default: true,
            animatable: false,
            visible: false,
            override: true,
        },
        cancelInnerEvents: {
            default: true,
            animatable: false,
            visible: false,
            override: true,
        },
        verticalScrollBar: {
            default: undefined,
            type: cc.Scrollbar,
            notify () {},
            animatable: false,
            visible: false,
            override: true,
        },
        horizontalScrollBar: {
            default: undefined,
            type: cc.Scrollbar,
            notify () {},
            animatable: false,
            visible: false,
            override: true,
        },

        item : {
        	default : null,
            type: cc.Prefab,
            tooltip : "视图的cell的预制体",
        },
        
        isDelay : {
            default : false,
            tooltip : "是否延迟显示,可以做列表动画效果",
        },

        delayTime : {
            default : 0.1,
            tooltip : "单个cell延迟间隔时间",
            visible(){
                return this.isDelay
            }
        },
        
        _direction : DirectType.VERTICAL,
        direction : {
            type : cc.Enum(DirectType),
            tooltip : "视图的滚动方向",
            get () {
                return this._direction
            },
            set : function (value) {
                this._direction = value
                this.horizontal = this._direction == DirectType.HORIZONTAL
                this.vertical = this._direction == DirectType.VERTICAL
            },
        },

        fillOrder : {
            type : cc.Enum(VerticalFillOrder),
            default : VerticalFillOrder.TOP_DOWN,
            tooltip : "视图垂直填充顺序",
            visible(){
                return this.direction == DirectType.VERTICAL
            },
        },

        alignment : {
            type : cc.Enum(Alignment),
            default : Alignment.MIDDLE,
            tooltip : "item的对齐方式",
        },

        spacing : {
            type : cc.Integer,
            default : 0,
            tooltip : "边框到边框之间的距离",
        },
    },

    ctor(){
        this._datas = []  //列表数据信息
        this._showNodes = {}  //列表可见的cell
        this._vCellsPositions = []  //存储每一个cell的位置信息
        this._templateCell = null  //临时创建的cell对象
        this._freeNodes = new cc.NodePool()  //被移除的cell存放池子

        this.m_selectIndex = -1  //选中的idx
        this.m_initCallBack = null
        this.m_clickCallBack = null
    },

    onLoad () {
        var eventHandler = new cc.Component.EventHandler()
        eventHandler.target = this.node
        eventHandler.component = "TableView"
        eventHandler.handler = "scrollViewDidScroll"
        this.scrollEvents.push(eventHandler) //增加滑动监听事件
        var widget = this.node.getComponent(cc.Widget)
        if (widget){
            widget.updateAlignment()
        } 

        //用于检测
        this.node.on("touch-up", (event)=>{
            let offset = this.getContainerOffset() 
            let size = this.getContainerSize() 
            let viewSize = this.node.getContentSize()
            if (this.getDirection() == DirectType.HORIZONTAL) {
                if (offset.x > 20) {
                    this.node.emit("touch-up-left", this)
                }else if(offset.x < viewSize.width - size.width - 20){
                    this.node.emit("touch-up-right", this)
                }
            }else{
                if (offset.y > 20) {
                    this.node.emit("touch-up-bottom", this)
                }else if(offset.y < viewSize.height - size.height - 20){
                    this.node.emit("touch-up-top", this)
                }
            }
        })
    },

    onDestroy(){ //销毁对象池对象
        this._datas = []
        this._showNodes = {}
        this._freeNodes.clear()
        this._vCellsPositions = []
    },

    _updateCellPositions(){ //更新所有cell的位置信息
        var cellsCount = this.getCellCount()
        if (cellsCount > 0) {
            var currentPos = 0
            var cellSize = cc.size(0,0)
            for (let i = 0; i < cellsCount; i++) {
                this._vCellsPositions[i] = currentPos
                cellSize = this.cellSizeForTable(i)
                if (this.getDirection() == this.DirectType.HORIZONTAL) {
                    currentPos += cellSize.width
                    if (i != cellsCount-1) {
                        currentPos += this.spacing
                    }
                }else{ 
                    currentPos += cellSize.height
                    if (i != cellsCount-1) {
                        currentPos += this.spacing
                    }
                }   
            }
            this._vCellsPositions[cellsCount] = currentPos
        }
        else{
            this._vCellsPositions[cellsCount] = 0
        }
    },

    _updateContentSize(){  //更新content容器的大小
        var size = cc.size(this.node.width, this.node.height)
        var cellsCount = this.getCellCount()
        if (cellsCount > 0) {
            var maxPosition = this._vCellsPositions[cellsCount]
            if (this.getDirection() == DirectType.HORIZONTAL) {
                size = cc.size(maxPosition, this.node.getContentSize().height)
            }else{
                size = cc.size(this.node.getContentSize().width, maxPosition)
            }
        }
        this.content.setContentSize(size)
    },

    _indexFromOffset(offset, isStart){ //通过偏移位置查找开始-结束的index范围
        let index = 0
        let tempoffset = cc.v2(offset.x, offset.y)
        let maxIdx = this.getCellCount() - 1
        
        if (this.fillOrder == this.VerticalFillOrder.TOP_DOWN) {
            tempoffset.y = this.getContainerSize().height - tempoffset.y
        }

        index = this.__indexFromOffset(tempoffset, isStart)
        if (index != -1){
            index = Math.max(0, index)
            if (index > maxIdx){
                index = maxIdx
            }
        }
        return index
    },

    __indexFromOffset(offset, isStart){
        var low = 0
        var search = 0
        var high = this.getCellCount() - 1
        if (this.getDirection() == this.DirectType.HORIZONTAL) {
            search = offset.x
        }else{
            search = offset.y
        }

        while (high >= low) {
            var index = low + Math.floor((high - low) / 2)
            var cellStart = this._vCellsPositions[index]
            var cellEnd = this._vCellsPositions[index + 1]
            if (search >= cellStart && search <= cellEnd){
                low = index
                break
            }
            else if (search < cellStart){
                high = index - 1
            }
            else{
                low = index + 1
            }
        }

        var count = this.getCellCount() - 1
        if (low <= 0) {
            return 0
        }else if(low >= count){
            return count
        }
        return low
    },

    getDequeueCell(){  //获取对象池里的cell，没有就重新创建
        if (this._freeNodes.size() > 0) {
            return this._freeNodes.get()
        }
        var cell = cc.instantiate(this._templateCell)
        cell.active = true
        let comp = cell.getComponent(cc.Button)
        if (comp == null || comp == undefined) {
            cell.addComponent(cc.Button)
        }

        cell.getCellIdx = ()=>{
            return cell._cellIdx
        }
        cell.setCellIdx = (idx)=>{
            cell._cellIdx = idx
        }

        cell.on("click", (event)=>{
            if(this.m_selectIndex == cell.getCellIdx()){
                this.m_selectIndex = cell.getCellIdx()  //当前选中项
                var currCell = this.getCellAtIndex(this.m_selectIndex)
                if (currCell != null && currCell != undefined) {

                    this.handleItemClick(this.m_selectIndex, currCell);
                }
                return 
            }

            var preCell = this.getCellAtIndex(this.m_selectIndex)//上一选中项
            if (preCell != null && preCell != undefined) {
                this.handleUpdateActive(preCell, false);
            }
    
            this.m_selectIndex = cell.getCellIdx()  //当前选中项
            var currCell = this.getCellAtIndex(this.m_selectIndex)
            if (currCell != null && currCell != undefined) {
                this.handleUpdateActive(currCell, true);
                this.handleItemClick(this.m_selectIndex, currCell);
            }
        }, this)
        return cell
    },

    getItemPos(idx, cell){   //通过index获取cell的位置信息
        var offset = cc.v2(0, 0)
        if (this.getDirection() == this.DirectType.VERTICAL) {
            offset.y = this._vCellsPositions[idx]
            if (this.fillOrder == this.VerticalFillOrder.TOP_DOWN) {
                var cellSize = this.cellSizeForTable(idx)
                offset.y = this.getContainerSize().height - offset.y - cellSize.height
            }

            if (this.alignment == this.Alignment.MIDDLE) {
                offset.x = (this.node.getContentSize().width-cell.width)*0.5
            }else if(this.alignment == this.Alignment.RIGHT_BOTTOM) {
                offset.x = this.node.getContentSize().width-cell.width
            }else{
                offset.x = 0
            }
        }else{
            offset.x = this._vCellsPositions[idx]
            if (this.alignment == this.Alignment.MIDDLE) {
                offset.y = (this.node.getContentSize().height-cell.height)*0.5
            }else if(this.alignment == this.Alignment.RIGHT_BOTTOM) {
                offset.y = 0
            }else{
                offset.y = this.node.getContentSize().height-cell.height
            }
        } 
        return offset
    },
    
    handleUpdateActive( cell, isActive ){
        let cellObj = cell.getComponent(Agui.BaseCell)
        cellObj.handleUpdateActive(isActive)
    },

    handleCellUpdateAnim(cell, delay){
        if (this.isDelay && delay > 0) {
            let cellObj = cell.getComponent(Agui.BaseCell)
            cellObj.handleUpdateAnim(delay)
        }
    },

    handleCellUpdateData(cell, idx, data){
        let cellObj = cell.getComponent(Agui.BaseCell)
        cellObj.handleUpdateData(this, idx, data)
    },
    
    updateCellAtIndex(idx, delay){  //通过index更新cell信息
        let v = this._datas[idx]
        let cell = this._showNodes[idx]

        if (cell == null || cell == undefined) {
            cell = this.getDequeueCell()
            cell.setCellIdx(idx)
            this.content.addChild(cell)
            this._showNodes[idx] = cell
            this.handleCellUpdateAnim(cell, delay)
            this.handleCellUpdateData(cell, idx, v)

            this.handleUpdateActive(cell, idx == this.m_selectIndex)
            cell.position = this.getItemPos(idx, cell)
        }
        else if(cell.getCellIdx() == null || cell.getCellIdx() == undefined){
            cell.setCellIdx(idx)

            this.handleCellUpdateAnim(cell, delay)
            this.handleCellUpdateData(cell, idx, v)
            this.handleUpdateActive(cell, idx == this.m_selectIndex)

            cell.position = this.getItemPos(idx, cell)
        }
    },

    scrollViewDidScroll(isDelay){ //滑动事件的逻辑处理，计算startIdx-endIdx值，并且更新
        var cellsCount = this.getCellCount()
        if (cellsCount == 0)
            return
        let startIdx = 0, endIdx = 0, idx = 0, maxIdx = 0, delay = 0
        let viewSize = this.node.getContentSize()
        let offset = this.getContainerOffset()
        let tempOffset = cc.v2(offset.x*-1, offset.y*-1)
        let dt = (typeof(isDelay) == "boolean" && isDelay) ? this.delayTime : 0

        maxIdx = Math.max(cellsCount-1, 0)
        if (this.fillOrder == this.VerticalFillOrder.TOP_DOWN) {
            tempOffset.y = tempOffset.y + viewSize.height
        }
        startIdx = this._indexFromOffset(tempOffset, true)

        if (this.fillOrder == this.VerticalFillOrder.TOP_DOWN) {
            tempOffset.y = tempOffset.y - viewSize.height
        }else{
            tempOffset.y = tempOffset.y + viewSize.height
        }

        tempOffset.x = tempOffset.x + viewSize.width
        endIdx = this._indexFromOffset(tempOffset, false)

        // console.log("==========scrollViewDidScroll============startIdx:" + startIdx + " endIdx:" + endIdx )
        for (const key in this._showNodes) {
            var cell = this._showNodes[key]
            idx = cell.getCellIdx()
            //检测显示的cell是否已经移出框外了
            if ((idx >=0 && idx < startIdx) || (idx <= maxIdx && idx > endIdx)) {
                cell.setCellIdx(null)
                this._freeNodes.put(cell)
                delete this._showNodes[key]
                if (cell.isValid && cc.isValid(cell, true)) {
                    cell.removeFromParent()  
                }
            }
        }

        if (this.getDirection() == this.DirectType.VERTICAL &&
            this.fillOrder == this.VerticalFillOrder.BOTTOM_UP && isDelay) {
                delay = (endIdx-startIdx)*dt
        }

        for (let i = startIdx; i <= endIdx; i++) {
            if (i < 0 || i > this.getCellCount()) {
                continue
            }
            this.updateCellAtIndex(i, delay)
            if (this.getDirection() == this.DirectType.VERTICAL &&
            this.fillOrder == this.VerticalFillOrder.BOTTOM_UP && isDelay) {
                delay -= dt
            }else{
                delay += dt
            }
        }
    },


    //获取最小边界值
    _getMinBoundOffsetPos(){
        var offset = this.getContainerOffset()
        var viewSize = this.node.getContentSize()
        var containerSize = this.getContainerSize()
        if (this.getDirection() == this.DirectType.VERTICAL){ //纵向
            var offsetY = viewSize.height - containerSize.height
            return cc.v2(offset.x, offsetY)
        }else{
            var offsetX = viewSize.width - containerSize.width
            return cc.v2(offsetX >= 0 ? 0 : offsetX, offset.y)
        }
    },

     //获取最大边界值
     _getMaxBoundOffsetPos(){
        var offset = this.getContainerOffset()
        var viewSize = this.node.getContentSize()
        var containerSize = this.getContainerSize()
        if (this.getDirection() == this.DirectType.VERTICAL){ //纵向
            var offsetY = viewSize.height - containerSize.height
            return cc.v2(offset.x, offsetY <= 0 ? 0 : offsetY)
        }else{
            return cc.v2(0, offset.y)
        }
    },

    //获取cell的size大小
    cellSizeForTable(idx){ 
        if (this._templateCell == null) {
            if (this.content.childrenCount > 0) {
                this._templateCell = this.content.children[0]
                this._templateCell.active = false
            }else{
                this._templateCell = cc.instantiate(this.item)
                this.node.addChild(this._templateCell)
                this._templateCell.active = false
                var widget = this._templateCell.getComponent(cc.Widget)
                if (widget != null && widget != undefined) {
                    widget.updateAlignment() 
                }
            }
        }

        var baseCell = this._templateCell.getComponent("BaseCell")
        if (baseCell != null && baseCell != undefined && baseCell.getCellSize) {
            return baseCell.getCellSize(idx, this._datas[idx])
        }
        return this._templateCell.getContentSize()
    },

    //移动到上一次的位置
    gotoPreOffsetPos(preOffset, preSize){
        var viewSize = this.node.getContentSize()
        var currSize = this.getContainerSize()
        if (this.getDirection() == this.DirectType.VERTICAL){
            if (viewSize.height - currSize.height >= 0) {
                this.setContainerOffset(cc.v2(0, viewSize.height - currSize.height))
            }else{
                var h = preSize.height - (viewSize.height - preOffset.y)
                var space = currSize.height - h - viewSize.height
                if (space >= 0){
                    this.setContainerOffset(cc.v2(0, space * -1))
                }else{
                    this.setContainerOffset(cc.v2(0, 0))
                } 
            }
        }else{
            if (viewSize.width - currSize.width >= 0 || preOffset.x >= 0) {
                this.setContainerOffset(cc.v2(0, 0))
            }else{
                var w = currSize.width + preOffset.x
                var space = viewSize.width - w
                if (space > 0){
                    this.setContainerOffset(cc.v2(preOffset.x + space, 0))
                }else{
                    this.setContainerOffset(cc.v2(preOffset.x, 0))	
                }	
            }
        }
    },

    //==================================================///

    setData( data ){  //设置列表数据
        this._datas = data
    },

    getData(){  //获取列表数据
        return this._datas
    },

    getCellCount(){  //获取列表的长度
        return this._datas.length
    },

    getDirection(){  //获取视图的滚动方向
        return this.direction
    },

    getContainerOffset(){ //获取容器的偏移位置
        return this.content.position
    },

    setContainerOffset(pos){ //设置容器的偏移位置
        var minPos = this._getMinBoundOffsetPos()
        var maxPos = this._getMaxBoundOffsetPos()
        if (this.getDirection() == DirectType.HORIZONTAL) { //水平
            var offsetPosX = pos.x > minPos.x ? pos.x : minPos.x
            offsetPosX = offsetPosX < maxPos.x ? offsetPosX : maxPos.x
            this.content.position = cc.v2(offsetPosX, pos.y)
        }else{
            var offsetPosY = pos.y > minPos.y ? pos.y : minPos.y
            offsetPosY = offsetPosY < maxPos.y ? offsetPosY : maxPos.y
            this.content.position = cc.v2(pos.x, offsetPosY)
        }
    },

    getContainerSize(){ //获取容器的大小
        return this.content.getContentSize()
    },

    getCellAtIndex(index){ //通过index获取cell
        if (index < 0) {
            return undefined
        }
        for (const i in this._showNodes) {
            if (this._showNodes[i] != null && this._showNodes[i] != undefined) {
                var idx = this._showNodes[i].getCellIdx()
                if (idx == index){
                    return this._showNodes[i]
                } 
            }
        }
        return undefined
    },


    //重新加载数据
    //keep: 是否移动到上一次的位置
    reloadData(keep){
        var cellsCount = this.getCellCount()
        for (const key in this._showNodes) {
            const cell = this._showNodes[key]
            cell.setCellIdx(null)
            this._freeNodes.put(cell)
            if (cell.isValid && cc.isValid(cell, true) && cell.parent == this.content) {
                cell.removeFromParent(false)  
            }
        }
        this.stopAutoScroll()

        this._showNodes = {}
        var preOffset = this.getContainerOffset()
        var preContentSize = this.getContainerSize()
    
        this._updateCellPositions()
        this._updateContentSize()
        if (keep) {
            // this.setContainerOffset(preOffset)
            this.gotoPreOffsetPos(preOffset, preContentSize)
        }else{
            var y = this.getDirection() == DirectType.VERTICAL ? this.node.height - this.content.height : 0
            this.setContainerOffset(cc.v2(0, y))
        }        

        if(cellsCount > 0){
            this.scrollViewDidScroll(this.isDelay)
        }
    },

    //设置初始选中响应回调
    setInitCallBack(callBack){
        this.m_initCallBack = callBack
    },

    //设置选中的回调
    setClickCallBack(callBack){
        this.m_clickCallBack = callBack
    },

    handleItemClick( idx, cell, data ){
        let baseCell = cell.getComponent(Agui.BaseCell)
        baseCell.handleCellClick()
        if (this.m_clickCallBack != null && this.m_clickCallBack != undefined) {
            var cellDataList = this.getData()
            this.m_clickCallBack.call(this, cell, cellDataList[idx])
        }
        
    },

    //初始默认选中的
    setInitSelect(index){
        var preCell = this.getCellAtIndex(this.m_selectIndex)
        //上一选中项
        if (preCell != null && preCell != undefined) {
            this.handleUpdateActive(preCell, false)
        }

        //当前选中项
        this.m_selectIndex = index ? (index) : 0
        var cell = this.getCellAtIndex(this.m_selectIndex)
        if (cell != null && cell != undefined) {
            this.handleUpdateActive(cell, true)
            if (this.m_initCallBack != null && this.m_initCallBack != undefined) {
                var cellDataList = this.getData()
                this.m_initCallBack.call(this, cell, cellDataList[this.m_selectIndex])
            }
        }
    },

    //获取选中的cell对象
    getSelectCell(){
        var cell = this.getCellAtIndex(this.m_selectIndex)
        return cell
    },

    //获取选中的数据信息
    getSelectCellData(){
        var cellDataList = this.getData()
        return cellDataList[this.m_selectIndex]
    },
});


TableView.prototype.Alignment = Alignment
TableView.prototype.DirectType = DirectType
TableView.prototype.VerticalFillOrder = VerticalFillOrder
module.exports = TableView