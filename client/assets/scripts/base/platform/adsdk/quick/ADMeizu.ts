
import * as cc from "cc"
import { ADVideoType } from "../ADBase";
import { ADQuick } from "./ADQuick";
const {ccclass, property} = cc._decorator;

const S_BANNER_ADID = "jUKduXv9"
const S_VIDEO_ADID = "CQ4fN7FJ"
const S_INTERSTITIAL_ADID = "m95vfqbK"

let tempWind : any = window;
let mz : any = tempWind.mz;

@ccclass('ADMeizu')
export class ADMeizu extends ADQuick{

    public init(){
        this.m_banner_adid = S_BANNER_ADID;
        this.m_interstitial_adid = S_INTERSTITIAL_ADID;
        this.m_video_adid.set(ADVideoType.AD_DEFAULT, S_VIDEO_ADID);
        console.log("############# ADMeizu:init() ", S_BANNER_ADID, S_INTERSTITIAL_ADID);
        super.init();
    }

    

}
