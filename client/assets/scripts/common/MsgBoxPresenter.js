let MsgBoxPresenter = cc.Class({
    extends : require("BasePresenter"),
    
    getViewPath(){
        return "base/msgbox/msg_node";
    },

    onLoad(){
        this.m_delegate.setShowData(this.m_tips, this.m_isOnlyConfirm);
    },

    handleConfirmClick(){
        if(this.m_confirmCallback != null){
            this.m_confirmCallback();
        }

        this.close();
    },

    handleCancelClick(){
        if(this.m_cancelCallback != null){
            this.m_cancelCallback();
        }
        this.close();
    },

    show( tips, confirmCallback, cancelCallback, isOnlyConfirm){
       this.m_tips = tips;
       this.m_confirmCallback = confirmCallback;
       this.m_cancelCallback = cancelCallback;
       this.m_isOnlyConfirm = isOnlyConfirm;
       this._super(constant.LayerZorder.MSGBOX)
    }
})

let _static = {
    show(tips, confirmCallback, cancelCallback, isOnlyConfirm){
        let obj = new MsgBoxPresenter()
        var isOnlyConfirm = isOnlyConfirm == null ? cancelCallback == null : isOnlyConfirm;
        
        var tips = game.GameModel.getInstance().tryGetText(tips)

        obj.show(tips, confirmCallback, cancelCallback, isOnlyConfirm)
    },

    showConfirm( tips, confirmCallback){
        this.show(tips, confirmCallback, null, true )
    },

    showCancelConfirm( tips, confirmCallback, cancelCallback ){
        this.show(tips, confirmCallback, cancelCallback, false)
    },
}
module.exports = _static