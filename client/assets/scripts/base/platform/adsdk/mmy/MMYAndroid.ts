
import * as cc from "cc"
import { log } from "../../../log/log";
import { utils } from "../../../utils/utils";
import { GameWorld } from "../../../../world/GameWorld";
import { ADBase, ADVideoType, BGravity, ListenerFunc } from "../ADBase";

const {ccclass, property} = cc._decorator;

const classVideoName = "channel/MomoyuUtil"            //激励视频

@ccclass('MMYAndroid')
export class MMYAndroid extends ADBase{

    public init(forceInit:boolean = false){
        log.d("############# MMYAndroid:init()")
    }

    public createBanner(pos:BGravity, finishCallback:ListenerFunc){
        if (typeof(finishCallback) == "function") {
            finishCallback(true)
        }
    }
    
    public createVideo( videoType : ADVideoType, finishCallback:ListenerFunc){
        this.init(true)

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
                code : "",
                msg : "",
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
            type : true,  //奖励类型：道具 = 1，章节 = 2，对局 = 3，其他 = 4
            name : "金币",  //奖励名称
            amount : 100,   // 奖励数量：道具/其他-具体数量，章节-第⼏章，对局-第⼏局
        })
        
        let sigs = "(Ljava/lang/String;)V"
        jsb.reflection.callStaticMethod(classVideoName, 'momoyuShowAd', sigs, stringify)
    }

    public createInterstitial(finishCallback:ListenerFunc){
        if (typeof(finishCallback) == "function") {
            finishCallback(true)
        }
    }
}

