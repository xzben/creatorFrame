
import * as cc from "cc"
import { log } from "../../log/log";
import { utils } from "../../utils/utils";
import { EventDispatcher } from "../../frame";
const {ccclass, property} = cc._decorator;

//Banner显示位置
export enum BGravity{
    LEFT_TOP = 1,         //左上  
    CENTER_TOP = 2,        //中上
    RIGHT_TOP = 3,        //右上
    LEFT_BOTTOM = 4,      //左下
    CENTER_BOTTOM = 5,     //中下
    RIGHT_BOTTOM = 6,      //右下
}

//视频广告类型
export enum ADVideoType{
    AD_DEFAULT,   //默认视频 
    AD_SHORT,   //短视频 
    AD_MIDDLE,   //中度视频
    AD_LONG,     //长视频
}


export type ListenerFunc = (...param : any)=>void;

@ccclass('ADBase')
export class ADBase {
    private m_isBase : boolean = false;
    protected m_delegate!: EventDispatcher;

    public init(){
        this.m_isBase = true;
        log.d("############# ADBase:init()")
    }

    public isBase(){
        return this.m_isBase;
    }

    public setDelegate(delegate:EventDispatcher){
        this.m_delegate = delegate;
    }

    //Banner广告
    public createBanner(pos:BGravity, finishCallback:ListenerFunc){
        if (typeof(finishCallback) == "function") {
            finishCallback(true)
        }
    }
    
    public refreshBanner(){

    }

    public clearBanner(){

    }

    //激励视频广告
    public createVideo( videoType : ADVideoType, finishCallback:ListenerFunc ){
        utils.AlertTips.show("暂无可播放视频，奖励已直接发放")
        finishCallback(true, false)
    }

    //全屏广告
    public createSplash( finishCallback:ListenerFunc ){
        if (typeof(finishCallback) == "function") {
            finishCallback(true)
        }
    }

    //插屏广告
    public createInterstitial(finishCallback:ListenerFunc){
        if (typeof(finishCallback) == "function") {
            finishCallback(true)
        }
    }

    //加载盒子广告
    public createAppBox(finishCallback:ListenerFunc){
        if (typeof(finishCallback) == "function") {
            finishCallback(true)
        }
    }

}
