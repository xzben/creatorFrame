let PlatformBase = require("PlatformBase")
let PlatformWx = require("PlatformWx")

let s_instance;
let _static = {
    getInstance(){
        if( s_instance === undefined ){
            log.d('===cc.sys.platform===type:', cc.sys.platform, cc.sys.isMobile)
            if(cc.sys.platform == cc.sys.WECHAT_GAME){
                s_instance = new PlatformWx();
            }else{
                s_instance = new PlatformBase();
            }
        }
        return s_instance;
    }
}

window.platform = _static;