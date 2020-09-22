cc.Class({
    extends: frame.BaseScenePresenter,
    properties: {
       
    },

    getViewPath(){
        return "uitest.testScene";
    },

    onLoad(){
        this._super();
        log.d("######################testScene:onLoad")
    },
    start(){
        this._super();
        let menuCfg = require("menuCfg")
        let tempData = []
        for (const key in menuCfg) {
            tempData.push(menuCfg[key])
        }
        this.m_delegate.updateList(tempData)
    },
});