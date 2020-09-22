let LogConsole = cc.Class({

    getLogFunc( level ){
        let LogLevel = require("LogLevel")
        let func = console.log

        switch(level){
            case LogLevel.INFO:
                func = console.info;
                break;
            case LogLevel.DEBUG:
                func = console.debug;
                break;
            case LogLevel.WARN:
                func = console.warn;
                break;
            case LogLevel.ERROR:
                func = console.error;
                break;
        }

        return func
    },

    handleLog(level, params){
        let func = this.getLogFunc(level)
        func.apply(null, params)
    },
})
export default LogConsole