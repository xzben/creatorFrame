cc.Class({
    extends: frame.BaseScenePresenter,
    properties: {
       
    },

    getViewPath(){
        return "uitest.testScene";
    },

    start(){
        this._super();
        log.d("############# start")
        let menuCfg = require("menuCfg")
        let tempData = []
        for (const key in menuCfg) {
            tempData.push(menuCfg[key])
        }
        this.m_delegate.updateList(tempData)
    },
});