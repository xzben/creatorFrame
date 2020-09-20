cc.Class({
    extends: frame.BaseView,

    properties: {
        view : {default : null,type: Agui.PickerView,},
        desc : {default : null,type: cc.Label,},
    },

    start () {
        var tempData = []
        for (let i = 0; i < 10; i++) {
            tempData.push(i)
        }
        
        this.view.setData(tempData)
        this.view.reloadData()
    },

    onBtnLeftPage(){
        this.view.gotoPrePage()
    },

    onBtnRightPage(){
        this.view.gotoNextPage()
    },

    onUpdatePageIndex(){
        var index = this.view.getCurrentIndex()
        this.desc.string = "Index of then middle is: " + index
    },

});
