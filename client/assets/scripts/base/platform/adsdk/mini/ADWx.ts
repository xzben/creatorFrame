
import * as cc from "cc"
import { ADVideoType } from "../ADBase";
import { ADMini } from "./ADMini";
const {ccclass, property} = cc._decorator;

const S_BANNER_ADID = "adunit-227da881c809b399"
const S_INTERSTITIAL_ADID = "adunit-f6e88dc3ba29b495"
const S_VIDEO_ADID : any = {
    [ADVideoType.AD_SHORT] : "adunit-0de16d4d6d5a80ab",
    [ADVideoType.AD_MIDDLE] : "adunit-6401a1d8eceea3af",
    [ADVideoType.AD_LONG] : "adunit-09442ca30ad6a123",
}

@ccclass('ADWx')
export class ADWx extends ADMini{
    protected getBannerSize(){
        return { bannerWidth : 300, bannerHeight : 0 };
    }
    public init(){
        this.m_banner_adid = S_BANNER_ADID;
        for (const key in S_VIDEO_ADID) {
            this.m_video_adid.set(Number(key), S_VIDEO_ADID[key]);
        }
        this.m_interstitial_adid = S_INTERSTITIAL_ADID;
        super.init();
    }
}