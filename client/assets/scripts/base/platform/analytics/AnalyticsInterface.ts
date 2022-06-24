
import * as cc from "cc"
import { log } from "../../log/log";
import { EventDispatcher } from "../../frame";
import { AnalyticsBase } from "./AnalyticsBase";
import { UMengH5 } from "./umeng/UMengH5";
import { TalkIOS } from "./talking/TalkIOS";
import { UMengMini } from "./umeng/UMengMini";
import { TalkAndroid } from "./talking/TalkAndroid";
import { ChannelType, PlatformType } from "../../../config/PlatformConfig";
import { UMengWeb } from "./umeng/UMengWeb";
const {ccclass, property} = cc._decorator;

export enum AnalyticsType{
    Talking = 1,  
    UMeng = 2,  
}

//数据统计配置
let SDKImp : any = {
	[PlatformType.Android] : {
        [ChannelType.Official] : TalkAndroid,
	},
	[PlatformType.IOS] : {
        [ChannelType.Official] : TalkIOS,
	},
    [PlatformType.H5] : {
        [ChannelType.MiniWX] : UMengMini,
        [ChannelType.MiniQQ] : UMengMini,
        [ChannelType.MiniByte] : UMengMini,
	},
    [PlatformType.QUICK] : {
        [ChannelType.QuickMEIZU] : AnalyticsBase,
	},
    [PlatformType.Web] : {
        [ChannelType.Official] : UMengWeb, 
	},
}


type CLS_NEW<T> =  new()=>T;
export type ListenerFunc = (...param : any)=>void;

@ccclass
export class AnalyticsInterface {
    private m_imp:AnalyticsBase = null!;
    private m_delegate!:EventDispatcher;
    private m_platform : PlatformType = PlatformType.WIN32;
    private m_channel : ChannelType = ChannelType.Official;

    constructor(platform : PlatformType, channel : ChannelType, delegate:EventDispatcher){
        this.m_platform = platform;
        this.m_channel = channel;
        this.m_delegate = delegate;
    }

    public init(){
        if (!this.m_imp) {
            let sdk:CLS_NEW<AnalyticsBase> = AnalyticsBase;
            if(this.m_platform == PlatformType.Android){
                sdk = SDKImp[this.m_platform][this.m_channel] || TalkAndroid;
            }else if(this.m_platform == PlatformType.IOS){
                sdk = SDKImp[this.m_platform][this.m_channel] || TalkIOS;
            }else{
                if (SDKImp[this.m_platform]) {
                    sdk = SDKImp[this.m_platform][this.m_channel] || AnalyticsBase;
                }
            } 
            this.m_imp = new sdk;
            this.m_imp.setDelegate(this.m_delegate);
            this.m_imp.init()
        }  
    }

    public enableDebug(enabled: boolean){
        this.m_imp.enableDebug(enabled)
    }

    public loginSuccess( roleID : number,  userName : string){
        this.m_imp.loginSuccess(roleID, userName)
    }

    public virtualReward(reason : string, currencyAmount : number){
        this.m_imp.virtualReward(reason, currencyAmount)
    }

    public virtualConsume(reason : string, count : number){
        this.m_imp.virtualConsume(reason, count)
    }

    public ItemConsume(item : string, itemNumber : number){
        this.m_imp.ItemConsume(item, itemNumber)
    }

    public levelsBegin(level : string){
        this.m_imp.levelsBegin(level)
    }

    public levelsCompleted(level : string){
        this.m_imp.levelsCompleted(level)
    }

    public levelsFailed(level : string, reason : string){
        this.m_imp.levelsFailed(level, reason)
    }

    public customEvent(eventId : string, eventData : any){
        this.m_imp.customEvent(eventId, eventData)
    }

}
