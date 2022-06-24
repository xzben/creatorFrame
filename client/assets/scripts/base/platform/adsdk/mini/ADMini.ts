
import * as cc from "cc"
import { log } from "../../../log/log";
import { SoundMgr } from "../../../core";
import { utils } from "../../../utils/utils";
import { GameWorld } from "../../../../world/GameWorld";
import { ADBase, ADVideoType, BGravity, ListenerFunc } from "../ADBase";
const {ccclass, property} = cc._decorator;

let tempWind : any = window;
let mini : any = tempWind.wx || tempWind.qq || tempWind.tt || tempWind.swan;

@ccclass('ADMini')
export class ADMini extends ADBase{
    protected m_brannerAd: any = null;
    protected m_interstitialAd: any = null;
    protected m_rewardedVideoAd:  Map<number, any> = new Map;
    protected m_banner_adid = '';
    protected m_interstitial_adid = '';
    protected m_video_adid : Map<number, string> = new Map;

    public init(){
        log.d("############# ADMini:init()")
        if (mini.createInterstitialAd){
            this.m_interstitialAd = mini.createInterstitialAd({
                adUnitId : this.m_interstitial_adid
            })
        }
        
        this.m_video_adid.forEach((value, key)=>{
            let videoAd = mini.createRewardedVideoAd({
                adUnitId : value,
                multiton : true, 
            })
            if (videoAd) {
                videoAd.onLoad(()=>{
                    log.d('激励视频广告加载成功')
                })  
                videoAd.onClose((res:any)=>{
                    log.d("===videoAd:onClose===", res)
                    this.m_delegate.dispatch("onAdClose", res);
                })  
                videoAd.onError((err:any)=>{
                    log.d("===videoAd:onError===", err)
                    this.m_delegate.dispatch("onVideoError", err.errCode, err.errMsg);
                }) 
                this.m_rewardedVideoAd.set(key, videoAd);      
            }
        }) 
    }

    protected getBannerSize(){
        return { bannerWidth : 320, bannerHeight : 0 };
    }

    public createBanner(pos : BGravity, finishCallback : ListenerFunc){
        let { bannerWidth, bannerHeight } = this.getBannerSize();
        let sysInfo = mini.getSystemInfoSync();
        let windowWidth = sysInfo.windowWidth;
        let windowHeight = sysInfo.windowHeight;
        console.log('====createBanner===', sysInfo, this.m_banner_adid);
        this.clearBanner();
        this.m_brannerAd = mini.createBannerAd({
            adUnitId: this.m_banner_adid,
            adIntervals : 30,
            style: {
                left: 0,
                top: 0,
                width: bannerWidth,
                height : bannerHeight,
            }
        })
          
        if (this.m_brannerAd) {
            this.m_brannerAd.onError((res:any)=>{
                console.log('bannerAd onError',res)
                if (typeof(finishCallback) == 'function') {
                    finishCallback(false, {
                        code : res.errCode,
                        msg : res.errMsg,
                    })
                }
            })
            // 尺寸调整时会触发回调
            // 注意：如果在回调里再次调整尺寸，要确保不要触发死循环！！！
            this.m_brannerAd.onResize((size : any) => {
                console.log('brannerAd.onResize:',size.width, size.height)
                let tempPosMap = {
                    [BGravity.LEFT_TOP] : cc.v2(0,0),
                    [BGravity.CENTER_TOP] : cc.v2((windowWidth-size.width)/2, 0),
                    [BGravity.RIGHT_TOP] : cc.v2(windowWidth-size.width, 0),
                    [BGravity.LEFT_BOTTOM] : cc.v2(0, windowHeight-size.height),
                    [BGravity.CENTER_BOTTOM] : cc.v2((windowWidth-size.width)/2, windowHeight-size.height),
                    [BGravity.RIGHT_BOTTOM] : cc.v2(windowWidth-size.width, windowHeight-size.height),
                }
                this.m_brannerAd.style.left = tempPosMap[pos].x;
                this.m_brannerAd.style.top = tempPosMap[pos].y;

                // console.log('===style====', tempPosMap[pos].x, tempPosMap[pos].y)
                this.m_brannerAd.show().then(()=>{
                    console.log('bannerAd show ok')
                    if (typeof(finishCallback) == 'function') {
                        finishCallback(true)
                    }
                }).catch((res : any)=>{
                    console.log('bannerAd show error',res)
                });
            });
        }
    }

    public clearBanner(){
        if (this.m_brannerAd) {
            this.m_brannerAd.destroy();
            this.m_brannerAd = null;
        }
    }

    public createVideo( videoType : ADVideoType, finishCallback : ListenerFunc ){
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
            if (videoTimeFunc) {
                GameWorld.getInstance().unschedule(videoTimeFunc);
                videoTimeFunc = null!;
            }
            if (typeof(finishCallback) == 'function') {
                finishCallback(isFinish, isError, errorMsg)
            }
            hideLoadingView()
        }
        videoTimeFunc = ()=>{
            doFinishCallback(null)
        }
        
        this.m_delegate.removeListenerByOwner(this, "onVideoError");
        this.m_delegate.removeListenerByOwner(this, "onAdClose");

        this.m_delegate.addListenerOnce("onVideoError", this, (errCode, errMsg)=>{
            isError = true 
            doFinishCallback({
                code : errCode,
                msg : errMsg,
            })
            log.d("=====onVideoError=====",  errCode, errMsg)
        })
    
        this.m_delegate.addListenerOnce("onAdClose", this, (res:any)=>{
            if (res && res.isEnded) {
                log.d("===videoAd:onRewardVerify===")
                isFinish = true;
            }
            log.d("=====onAdClose=====", isFinish)
            SoundMgr.getInstance().resumeMusic();
            GameWorld.getInstance().scheduleOnce(videoTimeFunc, 0.2)
        })

        let videoAd = this.m_rewardedVideoAd.get(videoType);
        if (!videoAd) {
            videoAd = this.m_rewardedVideoAd.get(ADVideoType.AD_DEFAULT);
        }
        if (videoAd) {
            videoAd.show()
            .then(()=>{
                log.d("=====onAdShow=====")
                hideLoadingView()
                SoundMgr.getInstance().pauseMusic();
            })
            .catch(() => {
                // 失败重试
                videoAd.load()
                .then(()=> videoAd.show())
                .catch((err:any) => {
                    this.m_delegate.dispatch("onVideoError", err.errCode, err.errMsg);
                })
            })
        }
        
    }


    public createInterstitial(finishCallback:ListenerFunc){
        if (this.m_interstitialAd) {
            log.d("=======createInterstitial==========")
            this.m_interstitialAd.show()
                .then(()=>{
                    log.d('onInterstitial ok')
                    if (typeof(finishCallback) == 'function') {
                        finishCallback(true)
                    }
                })
                .catch((err:any)=>{
                    log.d("=====onInterstitialError=====", err)
                    if (typeof(finishCallback) == 'function') {
                        finishCallback(false, {
                            code : err.errCode,
                            msg : err.errMsg,
                        })
                    }
                });   
        }
    }

}
