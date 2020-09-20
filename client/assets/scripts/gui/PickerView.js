

const MOVEMENT_FACTOR = 0.7;      //0~1
const AUTOSCROLL_FACTOR = 0.2;   //0~1

//滑动事件消息枚举
var ScrollEventType = cc.Enum({
    SCROLL_START : 0,
    SCROLL_ING : 1,
    SCROLL_END : 2,
})

var TableView = require("TableView")
//选择器列表视图
var PickerView = cc.Class({
    extends: TableView,
    properties: {
        brake: {
            default: 0.5,
            type: cc.Float,
            range: [0, 1, 0.1],
            visible: false,
            override: true,
        },
        elastic: {
            default: true,
            animatable: false,
            visible: false,
            override: true,
        },
        bounceDuration: {
            default: 1,
            range: [0, 10],
            visible: false,
            override: true,
        },
        // spacing : {
        //     type : cc.Integer,
        //     default : 0,
        //     visible: false,
        //     override: true,
        // },
    },

    ctor(){
        this._autoScrolling = false
        this._targetPos = cc.v2(0,0)
        this._currentSelectId = 1
        this._isTouching = false
        this._touchMoved = false
    },

    onLoad () {
        this._super()
    },

    start(){
        this._super()
    },

    onDestroy(){ //销毁对象池对象
        this._super()
    },

    setContainerOffset(pos){ //设置容器的偏移位置
        this.content.position = pos
    },

    handleUpdateCellScale( cell, scale ){
        let cellObj = cell.getComponent(Agui.BaseCell)
        cellObj.handleUpdateScale(scale);
    },

    scrollViewDidScroll(isDelay){ //滑动事件的逻辑处理，计算startIdx-endIdx值，并且更新
        this._super(isDelay)

        var offsetPos = this.getContainerOffset()
        for (const key in this._showNodes) {
            var cell = this._showNodes[key]
            if (this.getDirection() == this.DirectType.HORIZONTAL) {
                var itemCenter = offsetPos.x + cell.x + cell.width *0.5     //得到item的中心点
                var distance = Math.abs(this.node.width * 0.5 - itemCenter)  //得到列表中心点到item中心点的距离
                if (distance > cell.width){
                    this.handleUpdateCellScale(cell, 0.75)
                }else {
                    var scale = 0.75 + (1 - distance / cell.width) * 0.25
                    this.handleUpdateCellScale(cell, scale)
                }
            }else{
                var itemCenter = offsetPos.y + cell.y + cell.height / 2      //得到item的中心点
                var distance = Math.abs(this.node.height * 0.5 - itemCenter)  //得到列表中心点到item中心点的距离
                if (distance > cell.height){
                    this.handleUpdateCellScale(cell, scale)
                }else {
                    var scale = 0.75 + (1 - distance / cell.height) * 0.25
                    this.handleUpdateCellScale(cell, scale)
                }
            } 
        }
    },

    //二分搜索区间
    _binarySearchRegion(val){
        var low = 0
        var mid = 0
        var height = this._vCellsPositions.length - 2
        if (val < this._vCellsPositions[low]) {
            return low
        }else if(val > this._vCellsPositions[height]){
            return height
        }

        while( low <= height ){
            mid = Math.floor((low + height) / 2)
            var cellStart = this._vCellsPositions[mid]
            var cellEnd = this._vCellsPositions[mid + 1]
            if( val >= cellStart && val <= cellEnd ){
                return mid
            }else if(val > cellEnd){
                low = mid + 1
            }else{
                height = mid - 1
            }
        }
        return -1
    },

    _adjustContentOutOfBoundary () {
        this._outOfBoundaryAmountDirty = true;
    },

    _stopPropagationIfTargetIsMe1 (event) {
        if (event.eventPhase === cc.Event.AT_TARGET && event.target === this.node) {
            event.stopPropagation();
        }
    },

    //按下、移动触摸事件
    _onTouchBegan( event ){
        this._isTouching = true
        this._touchMoved = false
        this._deltaPos = cc.v2(0,0)
        this._preLocation = event.getStartLocation()
        let evt = {
            target :this,
            type :ScrollEventType.SCROLL_START,
        }
        cc.Component.EventHandler.emitEvents(this.scrollEvents, evt)
        this._stopPropagationIfTargetIsMe1(event)
    },

    _onTouchMoved(event){
        let touch = event.touch;
        let deltaMove = touch.getLocation().sub(touch.getStartLocation());
        if (deltaMove.mag() > 7) {
            if (!this._touchMoved && event.target !== this.node) {
                let cancelEvent = new cc.Event.EventTouch(event.getTouches(), event.bubbles)
                cancelEvent.type = cc.Node.EventType.TOUCH_CANCEL
                cancelEvent.touch = event.touch
                cancelEvent.simulate = true
                event.target.dispatchEvent(cancelEvent)
                this._touchMoved = true
            }
        }

        var offsetPos = this.getContainerOffset()
        if (this.getDirection() == this.DirectType.HORIZONTAL) { //水平
            this.setContainerOffset(cc.v2(offsetPos.x + event.getLocation().x - this._preLocation.x, offsetPos.y))
        }else{
            this.setContainerOffset(cc.v2(offsetPos.x, offsetPos.y + event.getLocation().y - this._preLocation.y))
        }
        
        this._preLocation = event.getLocation()
        var evt = {
            target :this,
            type :ScrollEventType.SCROLL_ING,
        }
        cc.Component.EventHandler.emitEvents(this.scrollEvents, evt);

        this._deltaPos = event.getDelta()
        this._stopPropagationIfTargetIsMe1(event)
    },

    //触摸结束事件
    _onTouchEnded(event){
        this._isTouching = false
        var offsetPos = this.getContainerOffset()
        if (this.getDirection() == this.DirectType.HORIZONTAL) { //水平
            var deltax = this.inertia ? this._deltaPos.x * MOVEMENT_FACTOR * 30 : 0
            var targetX = (offsetPos.x + deltax) * -1 + this.node.width*0.5
            this.gotoOffsetPosPage(cc.v2(targetX, offsetPos.y))
        }else{
            var deltay = this.inertia ? this._deltaPos.y * MOVEMENT_FACTOR * 30 : 0
            var targetY = (offsetPos.y + deltay) - this.node.height*0.5 + this.getContainerSize().height
            this.gotoOffsetPosPage(cc.v2(offsetPos.x, targetY))
        }   
        
        this._deltaPos = cc.v2(0,0)
        if (this._touchMoved) {
            event.stopPropagation()
        } else {
            this._stopPropagationIfTargetIsMe1(event)
        }
        console.log("_onTouchEnded")
    },

    _onTouchCancelled (event) {
        console.log("_onTouchCancelled", this._touchMoved)
        let touch = event.touch;
        let location = touch.getLocation()
        var box = this.node.getBoundingBox();
        var pos = this.node.parent.convertToNodeSpaceAR(location);
        if (!box.contains(pos)){
            this._isTouching = false
            var offsetPos = this.getContainerOffset()
            if (this.getDirection() == this.DirectType.HORIZONTAL) { //水平
                var targetX = (offsetPos.x) * -1 + this.node.width*0.5
                this.gotoOffsetPosPage(cc.v2(targetX, offsetPos.y))
            }else{
                var targetY = (offsetPos.y) - this.node.height*0.5 + this.getContainerSize().height
                this.gotoOffsetPosPage(cc.v2(offsetPos.x, targetY))
            }   
        }
    },

    //更新界面
    update(dt){
        if (this._autoScrolling && !this._isTouching)
        {
            if (this.getDirection() == this.DirectType.HORIZONTAL) { //水平
                this.content.x += (this._targetPos.x - this.content.x) * AUTOSCROLL_FACTOR
                // console.log("333##########", this._targetPos.x, this.content.x)
                if (this._targetPos.fuzzyEquals(this.content, 0.1))
                {
                    this._autoScrolling = false;
                    this.content.x = this._targetPos.x;
                    var event = {
                        target :this,
                        type :ScrollEventType.SCROLL_END,
                    }
                    cc.Component.EventHandler.emitEvents(this.scrollEvents, event);
                }else{
                    var event = {
                        target :this,
                        type :ScrollEventType.SCROLL_ING,
                    }
                    cc.Component.EventHandler.emitEvents(this.scrollEvents, event);
                }
            }else{
                this.content.y += (this._targetPos.y - this.content.y) * AUTOSCROLL_FACTOR
                if (this._targetPos.fuzzyEquals(this.content, 0.1))
                {
                    this._autoScrolling = false;
                    this.content.y = this._targetPos.y;
                    var event = {
                        target :this,
                        type :ScrollEventType.SCROLL_END,
                    }
                    cc.Component.EventHandler.emitEvents(this.scrollEvents, event);
                }else{
                    var event = {
                        target :this,
                        type :ScrollEventType.SCROLL_ING,
                    }
                    cc.Component.EventHandler.emitEvents(this.scrollEvents, event);
                } 
            }
 
        }
    },

    //停止自动滑动
    stopAutoScroll(){
        this._touchId = null
        this._autoScrolling = false
    },

    //用户是否在拖拽当前滚动视图
    isScrolling(){
        return this._isTouching
    },

    //当前滚动视图是否在惯性滚动
    isAutoScrolling(){
         return this._autoScrolling   
    },

    //滑动到具体位置
    scrollTo(pos, isAnim = true){
        this.stopAutoScroll()
        if (isAnim) {
            this._targetPos = pos
            this._autoScrolling = true
        }else{
            this._targetPos = pos
            this._autoScrolling = true
            this.setContainerOffset(pos)
            var event = {
                target :this,
                type :ScrollEventType.SCROLL_END,
            }
            cc.Component.EventHandler.emitEvents(this.scrollEvents, event)
        }
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
    
        this._updateCellPositions()
        this._updateContentSize()
        if (keep) {
            this.setContainerOffset(preOffset)
        }else{
            this.gotoIndexPage(0, false)
        }        

        if(cellsCount > 0){
            this.scrollViewDidScroll(this.isDelay)
        }
    },

    //跳转到上一个页签
    gotoPrePage(){
        if (this._currentSelectId > 0) {
            this.gotoIndexPage(this._currentSelectId - 1, true)
        }
    },

    //跳转到下一个页签
    gotoNextPage(){
        if (this._currentSelectId < (this.getCellCount()-1)) {
            this.gotoIndexPage(this._currentSelectId + 1, true)
        }
    },

    //跳转到指定的位置，自动校验位置到对应的index位置
    gotoOffsetPosPage(pos, isAnim){
        if (this.getDirection() == this.DirectType.HORIZONTAL) { //水平
            var index = this._binarySearchRegion(pos.x)
            this.gotoIndexPage(index, isAnim)
        }else{
            var index = this._binarySearchRegion(pos.y)
            this.gotoIndexPage(index, isAnim)
        }   
    },

    //跳转到指定的index位置
    gotoIndexPage(index, isAnim){
        if (index >= 0 && index < (this.getCellCount())) {
            this._currentSelectId = index
            var cellStart = this._vCellsPositions[this._currentSelectId]
            var cellEnd = this._vCellsPositions[this._currentSelectId + 1]
            if (this.getDirection() == this.DirectType.HORIZONTAL) { //水平
                var targetX = ((cellEnd + cellStart)*0.5 - this.node.width*0.5)*-1
                this.scrollTo(cc.v2(targetX, this.getContainerOffset().y), isAnim)
            }else{
                var targetY = (cellEnd + cellStart)*0.5 + this.node.height*0.5 - this.getContainerSize().height
                this.scrollTo(cc.v2(this.getContainerOffset().x, targetY), isAnim)
            }
        }
    },


    //获取当前页签的索引值
    getCurrentIndex(){
        if (!this.isScrolling() && !this.isAutoScrolling()) {
            return this._currentSelectId
        }

        var index = this._currentSelectId
        var offsetPos = this.getContainerOffset()
        if (this.getDirection() == this.DirectType.HORIZONTAL) { //水平
            var targetX = offsetPos.x * -1 + this.node.width*0.5
            index = this._binarySearchRegion(targetX)
            index = index < 0 ? 0 : index 
            index = index > this.getCellCount() ? this.getCellCount() : index
        }else{
            var targetY = offsetPos.y  - this.node.height*0.5 + this.getContainerSize().height
            index = this._binarySearchRegion(targetY)
            index = index < 0 ? 0 : index 
            index = index > this.getCellCount() ? this.getCellCount() : index
        }  
        return index
    },

    //获取当前页签的数据
    getCurrentData(){
        var curIndex = this.getCurrentIndex()
        return this._datas[curIndex]
    },

});


PickerView.prototype.ScrollEventType = ScrollEventType
module.exports = PickerView

