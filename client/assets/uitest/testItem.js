cc.Class({
    extends: Agui.BaseCell,
    properties: {
        titleLab : cc.Label,
    },

    handleCellClick(){
        if(this.m_data.pname != null)
        {
            let cls = require(this.m_data.pname)
            let obj = new cls();
            obj.show();
        }
        else if(this.m_data.vname != null)
        {
            let obj = new frame.BasePresenter(this.m_data.vname)
            obj.show(this.m_data.params)
        }
    },
    //更新cell数据
    updateData( idx, data ){
        this.m_data = data
        self.m_idx = idx
        this.titleLab.string = data.title
    },

    //获取cell的size  
    getCellSize(idx, cellData){
        var size = this.node.getContentSize()
        return cc.size(size.width, size.height)
    },
});
