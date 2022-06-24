/*
 * @Author: xzben
 * @Date: 2022-05-25 11:40:40
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 12:31:02
 * @Description: file content
 */
import * as cc from "cc"
import { AudioSourceBase } from "./AudioSourceBase"
import { AudioSourceWX } from "./AudioSourceWX"
import { AudioSourceCom } from "./AudioSourceCom"
import { platform } from "../../platform/platform";
import { ChannelType } from "../../../config/PlatformConfig";

//渠道指定的音频配置
let AudioChannelImp : any = {
    [ChannelType.MiniWX] : AudioSourceWX,
} 

type CLS_NEW<T> =  new()=>T;
export class AudioEngine{
    private static s_instance : AudioSourceBase = null!;
    public static getInstance() : AudioSourceBase{
        if(this.s_instance != null) return this.s_instance;

        let impClass:CLS_NEW<AudioSourceCom> = AudioSourceCom;
        let channel = platform.getInstance().getChannel();
        if (AudioChannelImp[channel]) {
            impClass = AudioChannelImp[channel] || AudioSourceCom;
        }
        this.s_instance = new impClass();
        this.s_instance.init();
        return this.s_instance;
    }
}
