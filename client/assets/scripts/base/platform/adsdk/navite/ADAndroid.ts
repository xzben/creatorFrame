
import * as cc from "cc"
import { log } from "../../../log/log";
import { utils } from "../../../utils/utils";
import { GameWorld } from "../../../../world/GameWorld";
import { ADBase, ADVideoType, BGravity, ListenerFunc } from "../ADBase";

const {ccclass, property} = cc._decorator;

const classCommon = "com/ad/ADUtil"

@ccclass('ADAndroid')
export class ADAndroid extends ADBase{

    public init(){
        log.d("############# ADAndroid:init()")
    }

    public createBanner(pos:BGravity, finishCallback:ListenerFunc){
        let sigs = "(Ljava/lang/String;)V"
        let stringify = JSON.stringify({
            refreshTime : 30*1000,
            index : pos,
            adCount : 1,
            viewWidth : 320,
            viewHeight : 50,
        })
        jsb.reflection.callStaticMethod(classCommon, 'createBannerAd', sigs, stringify)
    }
    
    public clearBanner(){
        let sigs = "()V"
        jsb.reflection.callStaticMethod(classCommon, 'clearBanner', sigs)
    }

    public createVideo( videoType : ADVideoType, finishCallback:ListenerFunc){
        let isFinish = false
        let isError = false
    
        let isHideLoading = false
        utils.LoadingView.show()
        
        let hideLoadingView = function(){
            if (isHideLoading) {
                return 
            }
            isHideLoading = true
            utils.LoadingView.close()
        }

        let videoTimeFunc : Function = null!;
        let doFinishCallback = (errorMsg:any)=>{
            videoTimeFunc && GameWorld.getInstance().unschedule(videoTimeFunc);
            videoTimeFunc = null!;
            if (typeof(finishCallback) == 'function') {
                finishCallback(isFinish, isError, errorMsg)
            }
            hideLoadingView()
        }
        videoTimeFunc = ()=>{
            doFinishCallback(null)
        }
        
        this.m_delegate.removeListenerByOwner(this, "onAdShow");
        this.m_delegate.removeListenerByOwner(this, "onVideoError");
        this.m_delegate.removeListenerByOwner(this, "onRewardVerify");
        this.m_delegate.removeListenerByOwner(this, "onAdClose");
    
        this.m_delegate.addListenerOnce("onAdShow", this, ()=>{
            log.d("=====onAdShow=====")
            hideLoadingView()
        })
    
        this.m_delegate.addListenerOnce("onVideoError", this, ()=>{
            isError = true 
            doFinishCallback({
                code : 10000,
                msg : "视频广告播放错误回调",
            })
            log.d("=====onVideoError=====")
        })

        this.m_delegate.addListenerOnce("onError", this, (msg:any)=>{
            if (msg && msg.code && msg.message){
                isError = true 
                log.d("=====onError=====", msg.code, msg.message)
                doFinishCallback({
                    code : msg.code,
                    msg : msg.message,
                })
            }  
        })
    
        this.m_delegate.addListenerOnce("onRewardVerify", this, (msg)=>{
            log.d("=====onRewardVerify=====", msg)
            if (msg && msg.rewardVerify){
                isFinish = true 
            }
        })
    
        this.m_delegate.addListenerOnce("onAdClose", this, ()=>{
            log.d("=====onAdClose=====")
            GameWorld.getInstance().scheduleOnce(videoTimeFunc, 0.5)
        })
        
        let stringify = JSON.stringify({
            adCount : 1,
            rewardName : "金币",
            rewardNum : 100,
            data : "media_extra",
            accountId : "0008",
            isLand : true,
            autoShow : true,
        })
        
        let sigs = "(Ljava/lang/String;)V"
        jsb.reflection.callStaticMethod(classCommon, 'createVideoAd', sigs, stringify)
    }

    public createInterstitial(finishCallback:ListenerFunc){
        let stringify = JSON.stringify({
            viewWidth : 640,
            viewHeight : 320,
            isLand : true,
        })
        let sigs = "(Ljava/lang/String;)V"
        jsb.reflection.callStaticMethod(classCommon, 'createInterstitialAd', sigs, stringify)
    }

}

