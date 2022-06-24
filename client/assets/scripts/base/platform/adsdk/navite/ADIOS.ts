
import * as cc from "cc"
import { log } from "../../../log/log";
import { utils } from "../../../utils/utils";
import { GameWorld } from "../../../../world/GameWorld";
import { ADBase, ADVideoType, BGravity, ListenerFunc } from "../ADBase";
const {ccclass, property} = cc._decorator;

const classCommon = "ADUtil"

@ccclass('ADIOS')
export class ADIOS  extends ADBase{
    private m_splashTimerFunc: any = null;

    public init(){
        log.d("############# ADIOS:init()")
    }


    public createBanner(pos:BGravity, finishCallback:ListenerFunc){
        let args = {
            isDeepLink : true,
            index : pos,
            width : 320,
            height : 50,
        }
        let stringify = JSON.stringify(args)
        log.d("===ts==createBanner=====", stringify)
        jsb.reflection.callStaticMethod(classCommon, 'createBannerAd:', stringify); 
    }
    
    public clearBanner(){
        let args = {
        }
        let stringify = JSON.stringify(args)
        jsb.reflection.callStaticMethod(classCommon, 'clearBannerAd:', stringify); 
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
    
        this.m_delegate.addListenerOnce("onVideoError", this, (error:any)=>{
            isError = true 
            doFinishCallback({
                code : error.errorCode,
                msg : error.errorMsg,
            })
            log.d("=====onVideoError=====", error.errorCode, error.errorMsg)
        })
    
        this.m_delegate.addListenerOnce("onRewardVerify", this, ()=>{
            log.d("=====onRewardVerify=====")
            isFinish = true 
            doFinishCallback(null)
        })
    
        this.m_delegate.addListenerOnce("onAdClose", this, ()=>{
            log.d("=====onAdClose=====")
            GameWorld.getInstance().scheduleOnce(videoTimeFunc, 0.5)
        })
        
        let args = {
            userId : "user123",
        }
        let stringify = JSON.stringify(args)
        log.d("===ts==createVideo=====", stringify)
        jsb.reflection.callStaticMethod(classCommon, 'createVideoAd:', stringify)
    }


    public createInterstitial(){
        let args = {
            width : 400, 
            height : 267,
        }
        let stringify = JSON.stringify(args)
        log.d("===ts==createInterstitial=====", stringify)
        jsb.reflection.callStaticMethod(classCommon, 'createInterstitialAd:', stringify);
    }

}
