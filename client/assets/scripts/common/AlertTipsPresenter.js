let AlertTipsPresenter = cc.Class({
    extends : require("BasePresenter"),

    getViewPath(){
        return "base/alertTips/alert_tips_bg";
    },

    onLoad(){
        this.m_delegate.setText(this.m_content)
    },

    show( tips ){
        this.m_content = tips
        this._super(constant.LayerZorder.ALERT_TIPS, null, true, false, false);
    }
})


let _static = {
    show(tips){
        let obj = new AlertTipsPresenter()
        obj.show(game.GameModel.getInstance().tryGetText(tips))
    },
}
module.exports = _static;