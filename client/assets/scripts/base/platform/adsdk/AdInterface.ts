
import * as cc from "cc"
import { log } from "../../log/log";
import { ADWx } from "./mini/ADWx";
import { ADQQ } from "./mini/ADQQ";
import { ADByte } from "./mini/ADByte";
import { ADMeizu } from "./quick/ADMeizu";
import { MMYAndroid } from "./mmy/MMYAndroid";
import { ADIOS } from "./navite/ADIOS";
import { ADAndroid } from "./navite/ADAndroid";
import { EventDispatcher } from "../../frame";
import { AutoView } from "../../utils/view/AutoView";
import { ADBase, ADVideoType, BGravity } from "./ADBase";
import { ChannelType, PlatformType } from "../../../config/PlatformConfig";

const {ccclass, property} = cc._decorator;

//渠道指定的广告配置
let SDKChannelImp : any = {
    [ChannelType.MiniWX] : ADWx,
    [ChannelType.MiniQQ] : ADQQ,
    [ChannelType.MiniByte] : ADByte,
    [ChannelType.QuickMEIZU] : ADMeizu,

    [ChannelType.MoMoYu] : MMYAndroid,
} 

type CLS_NEW<T> =  new()=>T;
export type ListenerFunc = (...param : any)=>void;

@ccclass
export class AdInterface {
    private m_imp : ADBase = null!;
    private m_delegate : EventDispatcher = null!;
    private m_platform : PlatformType = PlatformType.WIN32;
    private m_channel : ChannelType = ChannelType.Official;

    constructor(platform : PlatformType, channel : ChannelType, delegate:EventDispatcher){
        this.m_platform = platform;
        this.m_channel = channel;
        this.m_delegate = delegate;
    }

    public init(){
        if (!this.m_imp) {
            let sdk:CLS_NEW<ADBase> = ADBase;
            if (SDKChannelImp[this.m_channel]) {
                sdk = SDKChannelImp[this.m_channel] || ADBase;
            }
            else if(this.m_platform == PlatformType.Android){
                sdk = ADAndroid;
            }
            else if(this.m_platform == PlatformType.IOS){
                sdk = ADIOS;
            }
            this.m_imp = new sdk;
            this.m_imp.setDelegate(this.m_delegate);
            this.m_imp.init()
        }  
    }

    public setDelegate(delegate:EventDispatcher){
        this.m_delegate = delegate;
    }

    public createBanner(pos:BGravity, finishCallback:ListenerFunc, node:cc.Node|null = null){
        log.d("############## createBanner")
        if (this.m_imp.isBase()) {
            this.m_imp.createBanner(pos, finishCallback); 
            return true
        }
        if (node) {
            let autoView = node.addComponent(AutoView)
            autoView.setOpenCallback(()=>{
                log.d("############## openBanner")
                this.m_imp.createBanner(pos, finishCallback); 
            })
            autoView.setCloseCallback(()=>{
                log.d("############## closeBanner")
                this.m_imp.clearBanner(); 
            })
        }else{
            this.m_imp.createBanner(pos, finishCallback);
        }
        return false
    }

    public clearBanner(){
        log.d("############## clearBanner");
        this.m_imp.clearBanner();
    }

    public createVideo( videoType : ADVideoType, finishCallback : ListenerFunc){
        log.d("############## createVideo");
        this.m_imp.createVideo(videoType, finishCallback);
    }

    public createSplash( finishCallback : ListenerFunc ){
        log.d("############## createSplash");
        this.m_imp.createSplash(finishCallback);
    }

    public createInterstitial(finishCallback : ListenerFunc){
        log.d("############## createInterstitial");
        this.m_imp.createInterstitial(finishCallback);
    }

    public createAppBox(finishCallback : ListenerFunc){
        log.d("############## createAppBox");
        this.m_imp.createAppBox(finishCallback);
    }

}
