// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: frame.BaseView,

    properties: {
        alertTips : cc.Node,
        msgBoxConfirm    : cc.Node,
        msgBoxConfirmCancel : cc.Node,
        loading   : cc.Node,
    },

    onLoad(){
        this._super();
        util.addClickCallback(this.alertTips, ()=>{
            this.handleAlertTips();
        });

        util.addClickCallback(this.msgBoxConfirm, ()=>{
            this.handleMsgBoxConfirm();
        });

        util.addClickCallback(this.msgBoxConfirmCancel, ()=>{
            this.handleMsgBoxConfirmCancel();
        });

        util.addClickCallback(this.loading, ()=>{
            this.handleLoadingView();
        });
    },

    handleAlertTips(){
        log.d("######### common", common)
        common.AlertTips.show("tssssssss")
    },

    handleMsgBoxConfirm(){
        common.MsgBox.showConfirm("sssss", function(){
            log.d("############ handleMsgBox handleMsgBoxConfirm")
        });
    },

    handleMsgBoxConfirmCancel(){
        common.MsgBox.showCancelConfirm("sssss", function(){
            log.d("############ handleMsgBox showCancelConfirm ok")
        }, ()=>{
            log.d("###############handleMsgBox showCancelConfirm cancel")
        });
    },

    handleLoadingView(){
        common.LoadingView.getInstance().show("loadingview test....");

        this.scheduleOnce(()=>{
            common.LoadingView.getInstance().close();
        }, 3);
    },

    start () {

    },
});
