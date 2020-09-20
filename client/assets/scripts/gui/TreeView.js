
var TableView = require("TableView")

//伸缩展开列表
var TreeView = cc.Class({
    extends: TableView,
    properties: {
        
    },

    ctor(){
        this.m_cellCount = 0
        this.m_childrenName = "__childs__"
    },

     //设置展开的子节点数据名称
    setChildrenName(name){
        this.m_childrenName = name
    },

    //获取有效列表的长度
    getCellCount(){
        return this.m_cellCount
    },

    //内部函数 获取实际上的Cell的总个数
    _getActualCellCount(recIdx, childs){
        for (let i = 0; i < childs.length; i++) {
            var item = childs[i]
            if (item != null && item != undefined) {
                recIdx = recIdx + 1
                if (typeof item == "object" && item.__isExpand && item[this.m_childrenName]) {
                    recIdx = this._getActualCellCount(recIdx, item[this.m_childrenName])
                }
            }
        }
        return recIdx
    },

    //内部函数 获取实际上的CellData
    _getActualCellData(index, recIdx, childs, level){
        level = level || 1
        for (let i = 0; i < childs.length; i++) {
            var item = childs[i]
            if (item != null && item != undefined) {
                recIdx = recIdx + 1
                item.level = level
                if (recIdx == index) {
                    return {cellData:item, idx:recIdx} 
                }else if(typeof item == "object" && item.__isExpand && item[this.m_childrenName]){
                    var ret = this._getActualCellData(index, recIdx, item[this.m_childrenName], level + 1)
                    recIdx = ret.idx
                    if (ret.cellData != null && ret.cellData != undefined) {
                        return {cellData:ret.cellData, idx:ret.idx}
                    }
                }
            }
        }

        return {cellData:null, idx:recIdx} 
    },

    //内部函数 
    _unExpandAll(childs){
        if (childs == null || childs == undefined) {
            return 
        }

        for (let i = 0; i < childs.length; i++) {
            var item = childs[i]
            if (item != null && item != undefined) {
                if (typeof(item) == "object" && item.__isExpand) {
                    item.__isExpand = false
                    this._unExpandAll(item[this.m_childrenName])
                }
            }
        }
    },

    //展开指定索引的cell
    expand(index){
        var ret = this._getActualCellData(index + 1, 0, this._datas)
        var cellData = ret.cellData
        if (cellData != null && cellData != undefined) {
            cellData.__isExpand = true
        }
        this.reloadData(true)
    },

    //缩起指定索引的cell
    unExpand(index){
        var ret = this._getActualCellData(index + 1, 0, this._datas)
        var cellData = ret.cellData
        if (cellData != null && cellData != undefined) {
            cellData.__isExpand = false
        }
        this.reloadData(true)
    },

    //缩起所有的列表
    unExpandAll(){
        this._unExpandAll(this._datas)
    },

    //通过cellIdx获取expand状态
    getExpandStateByIdx(cellIdx){
        var ret = this._getActualCellData(cellIdx + 1, 0, this._datas)
        var cellData = ret.cellData
        if (cellData != null && cellData != undefined) {
            return cellData.__isExpand
        }
        return false
    },

    //通过index更新cell信息
    updateCellAtIndex(idx, delay){
        var cell = this._showNodes[idx]
        if (cell == null || cell == undefined) {
            cell = this.getDequeueCell()
            cell.setCellIdx(idx)
            this.content.addChild(cell)
            this._showNodes[idx] = cell
            var ret = this._getActualCellData(idx + 1, 0, this._datas)

            this.handleCellUpdateAnim(cell, delay)
            this.handleCellUpdateData(cell, idx, ret.cellData)

            cell.position = this.getItemPos(idx, cell)
        }
        else if(cell.getCellIdx() == null || cell.getCellIdx() == undefined){
            cell.setCellIdx(idx)
            let ret = this._getActualCellData(idx + 1, 0, this._datas)
            this.handleCellUpdateAnim(cell, delay)
            this.handleCellUpdateData(cell, idx, ret.cellData)
            cell.position = this.getItemPos(idx, cell)
        }   
    },

    //重新加载数据
    //keep: 是否移动到上一次的位置
    reloadData(keep){
        if (!keep) {
            this.unExpandAll()
        }
        this.m_cellCount = this._getActualCellCount(0, this._datas)
        this._super(keep)
    },

});


module.exports = TreeView