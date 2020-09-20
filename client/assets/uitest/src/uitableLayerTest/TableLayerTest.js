cc.Class({
    extends: frame.BaseView,

    properties: {
        view : {default : null,type: Agui.TableView,},
        view2 : {default : null,type: Agui.TableView,},
    },

    handleClose(){
        log.d("####### handleClose", this.m_presenter)
        this.m_presenter.close();
    },

    updateList( tempData){
        this.view.setData(tempData)
        this.view.reloadData()

        this.view2.setData(tempData)
        this.view2.reloadData()
    },
});
