cc.Class({
    extends: frame.BaseScene,
    properties: { 
        view : {default : null,type: Agui.TableView,},
    },

    onLoad() {
        this._super()
    },

    updateList( data){
        this.view.setData(data)
        this.view.reloadData()
    },


});
