const LogConsole = require("LogConsole")
let LogController = cc.Class({
    ctor(){
        this.m_level = config.log.LEVEL;
        this.m_delegates = []

        this.addDelegate(new LogConsole());
    },

    addDelegate( delegate ){
        this.m_delegates.push(delegate)
    },

    handleLog(level, params){
        if(this.m_level > level) return;

        this.m_delegates.forEach((delegate) => {
            delegate.handleLog(level, params)
        });
    }
});

export default frame.InstanceMgr.createInstance(LogController)