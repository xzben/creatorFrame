const BasePresenter = require("../frame/BasePresenter");

let LoadingViewPresenter = cc.Class({
    extends : require("BasePresenter"),
    
    ctor(){
        this.m_count = 0;
    },
    getViewPath(){
        return "base/loading/loading";
    },

    onLoad(){
        this.m_delegate.setTxtLoading(this.m_content);
    },

    update( dt ){
        if(cc.isValid(this.m_delegate))
            this.m_delegate.setTxtLoading(this.m_content);
    },

    checkAddAfterChangeScene(){
        log.d("#### checkAddAfterChangeScene")
        if(this.m_count > 0 && this.m_delegate == null ){
            this.showImp();
        }
    },

    onDestroy(){
        this._super();
        log.d("############ loadingview :onDestroy");
    },

    showImp(){
        log.d("################# LoadingView ShowImp")
        let BasePresenter = require("BasePresenter")
        BasePresenter.prototype.show.call(this, constant.LayerZorder.LOADING, null, false)
    },

    show( tips ){
        if(this.m_count == 0 ){
            this.m_content = game.GameModel.getInstance().tryGetText(tips);
            this.showImp();
        }
        this.m_count ++;
        log.d("#################### LoadingView:show", this.m_count)
    },

    close(){
        this.m_count --;
        if(this.m_count <= 0){
            this._super(false);
            this.m_count = 0;
        }
        log.d("#################### LoadingView:close", this.m_count)
    },
})

module.exports = require("InstanceMgr").createInstance(LoadingViewPresenter)