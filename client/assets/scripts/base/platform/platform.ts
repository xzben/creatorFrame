import * as cc from "cc"
import { PlatformBase } from "./platformBase"
import { PlatformIOS}  from "./platformIOS"
import { PlatformWeb}  from "./platformWeb"
import { platformWx}  from "./minigame/platformWx"
import { PlatformAndroid}  from "./platformAndroid"
import { platformQQ } from "./minigame/platformQQ"
import { platformByte } from "./minigame/platformByte"
import { platformMZ } from "./quickgame/platformMZ"


//sys.Platform 取值情况 https://docs.cocos.com/creator/3.0/api/zh/modules/core.html#sys-1
export class platform{
    private static s_instance : PlatformBase = null!;
    public static getInstance() : PlatformBase{
        if(this.s_instance != null) return this.s_instance;

        console.log("=====cc.sys.platform:", cc.sys.platform,cc.sys.Platform.IOS)
        if(cc.sys.platform == cc.sys.Platform.ANDROID){
            this.s_instance = new PlatformAndroid();
        }else if(cc.sys.platform == cc.sys.Platform.IPAD 
            || cc.sys.platform == cc.sys.Platform.IPHONE
            || cc.sys.platform == cc.sys.Platform.IOS){
            this.s_instance = new PlatformIOS();
        }else if(cc.sys.platform == cc.sys.Platform.WECHAT_GAME){
            console.log("=====cc.sys.isQQ_MINI:", cc.sys.isQQ_MINI)
            if (cc.sys.isQQ_MINI) {
                this.s_instance = new platformQQ();
            }else{
                this.s_instance = new platformWx();
            }
        }else if(cc.sys.platform == cc.sys.Platform.BYTEDANCE_MINI_GAME){
            this.s_instance = new platformByte();
        }else if(cc.sys.platform == cc.sys.Platform.DESKTOP_BROWSER 
                  || cc.sys.platform == cc.sys.Platform.MOBILE_BROWSER){
            if (cc.sys.isMEIZU_QUICK) {
                this.s_instance = new platformMZ();
            }else{
                this.s_instance = new PlatformWeb();
            }
        }
        else{
            this.s_instance = new PlatformBase();
        }
        this.s_instance.init();
        return this.s_instance;
    }
}

let tempWind : any = window;
tempWind.platformGlobalCallback = function(json:string){
    platform.getInstance().callJsEngine(json)
}