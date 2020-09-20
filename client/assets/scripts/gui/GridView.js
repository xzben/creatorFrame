var TableView = require("TableView")

//网格列表只支持相同大小的item
//grid网格的row/col都是自动计算的
var GridView = cc.Class({
    extends: TableView,
    properties: {
    },

    ctor(){
        this._oneCellCount = 0 //每个cell内元素的个数
    },
   
    _updateCellPositions(){ //更新所有cell的位置信息
        var cellsCount = this.getCellCount()
        if (cellsCount > 0) {
            var currentPos = 0
            var cellSize = cc.size(0,0)
            for (let i = 0; i < cellsCount; i++) {
                this._vCellsPositions[i] = currentPos
                cellSize = this.cellSizeForTable(i)
                if ((i+1)%this._oneCellCount == 0 || i == (cellsCount-1)) {
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
            }
            this._vCellsPositions[cellsCount] = currentPos
        }
        else{
            this._vCellsPositions[cellsCount] = 0
        }
    },

    _indexFromOffset(offset, isStart){ //通过偏移位置查找开始-结束的index范围
        let index = 0
        let tempoffset = cc.v2(offset.x, offset.y)
        let maxIdx = this.getCellCount() - 1
        tempoffset.y = this.getContainerSize().height - tempoffset.y
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
                if (isStart) {
                    low = Math.floor((index) / this._oneCellCount) * this._oneCellCount
                }else{
                    low = Math.ceil((index+1) / this._oneCellCount) * this._oneCellCount - 1
                }
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

    getItemPos(idx, cell){   //通过index获取cell的位置信息
        var offset = cc.v2(0, 0)
        var contetnSize = this.getContainerSize()
        var cellSize = this.cellSizeForTable()
        if (this.getDirection() == this.DirectType.VERTICAL) {
            var alignX = (this.node.getContentSize().width-this._oneCellCount*(cell.width+this.spacing)+this.spacing)
            if (this.fillOrder == this.VerticalFillOrder.TOP_DOWN) {
                offset.x = (cellSize.width + this.spacing)*(idx % this._oneCellCount)
                offset.y = contetnSize.height - (cellSize.height + this.spacing)*(Math.floor(idx / this._oneCellCount) + 1) + this.spacing
            }else{
                var tempIdx = this.getCellCount() - 1 - idx
                offset.x = (cellSize.width + this.spacing)*(tempIdx % this._oneCellCount)
                offset.y = contetnSize.height - (cellSize.height + this.spacing)*(Math.floor(tempIdx / this._oneCellCount) + 1) + this.spacing
            }

            if (this.alignment == this.Alignment.MIDDLE) {
                offset.x = offset.x + alignX*0.5
            }else if(this.alignment == this.Alignment.RIGHT_BOTTOM) {
                offset.x = offset.x + alignX
            }
        }else{
            offset.x = this._vCellsPositions[idx]
            var alignY = (this.node.getContentSize().height-this._oneCellCount*(cell.height+this.spacing)+this.spacing)
            offset.y = contetnSize.height - (cellSize.height + this.spacing)*(idx % this._oneCellCount + 1)
            if (this.alignment == this.Alignment.MIDDLE) {
                offset.y = offset.y - alignY*0.5
            }else if(this.alignment == this.Alignment.RIGHT_BOTTOM) {
                offset.y = offset.y - alignY
            }
        }
        return offset
    },

    scrollViewDidScroll(isDelay){ //滑动事件的逻辑处理，计算startIdx-endIdx值，并且更新

        this._super(isDelay)

        var cellsCount = this.getCellCount()
        if (cellsCount == 0)
            return
        let startIdx = 0, endIdx = 0, idx = 0, maxIdx = 0, delay = 0
        let dt = (typeof(isDelay) == "boolean" && isDelay) ? this.delayTime : 0
        let viewSize = this.node.getContentSize()
        let offset = this.getContainerOffset()
        offset = cc.v2(offset.x*-1, offset.y*-1)
        maxIdx = Math.max(cellsCount-1, 0)

        offset.y = offset.y + viewSize.height
        startIdx = this._indexFromOffset(offset, true)

        offset.y = offset.y - viewSize.height
        offset.x = offset.x + viewSize.width
        endIdx = this._indexFromOffset(offset, false)

        if (this.fillOrder == this.VerticalFillOrder.BOTTOM_UP) {
            var tempIdx = cellsCount - 1 - startIdx
            startIdx = cellsCount - 1 - endIdx
            endIdx = tempIdx
        }

        console.log("==========scrollViewDidScroll============startIdx:" + startIdx + " endIdx:" + endIdx )
        for (const key in this._showNodes) {
            var cell = this._showNodes[key]
            idx = cell.getCellIdx()
            if ((idx >=0 && idx < startIdx) || (idx <= maxIdx && idx > endIdx)) {
                cell.setCellIdx(null)
                this._freeNodes.put(cell)
                delete this._showNodes[key]
                if (cell.isValid && cc.isValid(cell, true)) {
                    cell.removeFromParent()  
                }
            }
        }

        for (let i = startIdx; i <= endIdx; i++) {
            if (i < 0 || i > this.getCellCount()) {
                continue
            }
            this.updateCellAtIndex(i, delay)
            delay += dt
        }
    },

    //重新加载数据
    //keep: 是否移动到上一次的位置
    reloadData(keep){
        let viewSize = this.node.getContentSize()
        let cellSize = this.cellSizeForTable(0)
        //自动计算每个cell内元素的个数
        if (this.getDirection() == this.DirectType.VERTICAL) {
            this._oneCellCount = Math.floor((viewSize.width+this.spacing) / (cellSize.width+this.spacing))
        }else{
            this._oneCellCount = Math.floor((viewSize.height+this.spacing) / (cellSize.height+this.spacing))
        }
        
        this._super(keep)
    },
});


module.exports = GridView