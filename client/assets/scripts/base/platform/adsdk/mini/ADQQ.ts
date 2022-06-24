
import * as cc from "cc"
import { ADVideoType } from "../ADBase";
import { ADMini } from "./ADMini";
const {ccclass, property} = cc._decorator;

const S_BANNER_ADID = "c6d3835f582d380046782143d196e749"
const S_VIDEO_ADID = "8864e5f4a1ef78c5b7af2bdab8597a26"
const S_INTERSTITIAL_ADID = "bb7720ad34727aea436b0cbda3818e1d"
const S_APPBOX_ADID = "e2979b4f96930d23e0358941ca6a883a"

let tempWind : any = window;
let qq : any = tempWind.qq;

@ccclass('ADQQ')
export class ADQQ extends ADMini{
    private m_appboxAd: any = null;

    public init(){
        this.m_banner_adid = S_BANNER_ADID;
        this.m_interstitial_adid = S_INTERSTITIAL_ADID;
        this.m_video_adid.set(ADVideoType.AD_DEFAULT, S_VIDEO_ADID);

        super.init();
        this.m_appboxAd = qq.createAppBox({
            adUnitId : S_APPBOX_ADID,
        })
    }

    public createAppBox(){
        this.m_appboxAd.load().then(()=>{
            this.m_appboxAd.show()
        })
    }
    

}
