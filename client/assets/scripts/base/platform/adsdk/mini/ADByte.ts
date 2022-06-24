
import * as cc from "cc"
import { ADVideoType, BGravity } from "../ADBase";
import { ADMini } from "./ADMini";
const {ccclass, property} = cc._decorator;

const S_BANNER_ADID = "2insig6tpr913jij9j"
const S_VIDEO_ADID = "ap3a9848i4119e9d5g"
const S_INTERSTITIAL_ADID = "1m3j092bf21277lfji"

let tempWind : any = window;
let mini : any = tempWind.tt;

@ccclass('ADByte')
export class ADByte extends ADMini{

    public init(){
        this.m_banner_adid = S_BANNER_ADID;
        this.m_interstitial_adid = S_INTERSTITIAL_ADID;
        this.m_video_adid.set(ADVideoType.AD_DEFAULT, S_VIDEO_ADID);
        super.init();
    }

    public createBanner(pos : BGravity){
        let bannerWidth = 128;
        let sysInfo = mini.getSystemInfoSync();
        let windowWidth = sysInfo.windowWidth;
        let windowHeight = sysInfo.windowHeight;
        console.log('====createBanner===', sysInfo, this.m_banner_adid);
        this.clearBanner();
        this.m_brannerAd = mini.createBannerAd({
            adUnitId: this.m_banner_adid,
            adIntervals : 30,
            style: {
                width: bannerWidth,
                top: windowHeight - (bannerWidth / 16) * 9,
            }
        })
          
        if (this.m_brannerAd) {
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
                console.log('===style====', tempPosMap[pos].x, tempPosMap[pos].y)
                
            });
          
            this.m_brannerAd.onError((res:any)=>{
                console.log('bannerAd onError',res)
            })
            this.m_brannerAd.onLoad((res:any)=>{
                console.log('bannerAd onLoad',res)
                this.m_brannerAd.show().then(()=>{
                    console.log('bannerAd show ok')
                }).catch((res : any)=>{
                    console.log('bannerAd show error',res)
                });
            })    
        }
    }
}