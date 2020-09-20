cc.Class({
    extends: frame.BasePresenter,
    properties: {
       
    },
    ctor(){

    },

    getViewPath(){
        return "uitest.prefabs/TableLayerTest";
    },


    start(){
        this._super();
        var tempData = []
        for (let i = 0; i < 20; i++) {
            tempData.push(i)
        }

        this.m_delegate.updateList(tempData);
    },

});