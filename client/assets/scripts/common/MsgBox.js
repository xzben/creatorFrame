cc.Class({
    name : "MsgBox",
    extends: require("BaseView"),
    properties: {
        cancelBtn : cc.Node,
        confirm1  : cc.Node,
        confirm2  : cc.Node,
        title     : cc.Label,
        content   : cc.RichText,
    },

    onLoad(){
        this._super();

        util.addClickCallback(this.cancelBtn, ()=>{
            this.m_presenter.handleCancelClick();
        })

        util.addClickCallback(this.confirm1, ()=>{
            this.m_presenter.handleConfirmClick();
        })

        util.addClickCallback(this.confirm2, ()=>{
            this.m_presenter.handleConfirmClick();
        })
    },

    setShowData(content, onlyConfirm ){
        this.content.string = content;
        this.confirm1.active = onlyConfirm
        this.cancelBtn.active = !onlyConfirm
        this.confirm2.active = !onlyConfirm
        
    },
});