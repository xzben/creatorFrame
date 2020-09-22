cc.Class({
    extends: frame.BaseScene,
    properties: { 
        view : {default : null,type: Agui.TableView,},
    },

    ctor(){
        log.d("################ test Scene ctor")
    },
    onLoad() {
        log.d("################ test Scene onLoad")
        this._super()
    },

    updateList( data){
        this.view.setData(data)
        this.view.reloadData()
    },


});
