import * as cc from "cc";
import { AudioSourceBase } from "./AudioSourceBase";

const { ccclass } = cc._decorator;

let tempWind : any = window;
let wx : any = tempWind.wx;

@ccclass("AudioSourceWX")
export class AudioSourceWX extends AudioSourceBase{
    private m_audioSource : any = null;

    constructor(){
        super();
    }

    get enabled(): boolean{
        return this._enabled;
    }
    set enabled(value: boolean){
        this._enabled = value;

    }

    set clip(val: cc.AudioClip | null){
        this._clip = val;
        if (this.m_audioSource) {
            this.m_audioSource.src = val?.nativeUrl;  
        }
    }
    get clip(): cc.AudioClip | null{
        return this._clip;
    }

    set loop(val: boolean){
        this._loop = val;
        if (this.m_audioSource) {
            this.m_audioSource.loop = val;  
        }
    }
    get loop(): boolean{
        return this._loop;
    }
    
    set playOnAwake(val: boolean){
        this._playOnAwake = val;
        if (this.m_audioSource) {
            this.m_audioSource.autoplay = val;  
        }
    }
    get playOnAwake(): boolean{
        return this._playOnAwake;
    }

    set volume(val: number){
        this._volume = val;
        if (this.m_audioSource) {
            this.m_audioSource.volume = val;  
        }
    }
    get volume(): number{
        return this._volume;
    }

    init(){
        super.init();
        console.log("############# AudioSourceWX:init()")
        this.m_audioSource = wx.createInnerAudioContext();
        wx.onShow(()=>{
            this.resume()
        });
        wx.onHide(()=>{
            this.pause()
        });
    }
    
    play(): void{
        super.play();
        if (this.m_audioSource) {
            this.m_audioSource.play();  
        }
    }
    
    pause(): void{
        super.pause();
        if (this.m_audioSource) {
            this.m_audioSource.pause();  
        }
    }

    resume(): void{
        super.resume();
        if (this.m_audioSource) {
            this.m_audioSource.play();  
        }
    }

    stop(): void{
        super.stop();
        if (this.m_audioSource) {
            this.m_audioSource.stop();  
        }
    }

    playOneShot(clip: cc.AudioClip, volumeScale: number): void{
        let audioSource = wx.createInnerAudioContext();
        if (audioSource) {
            audioSource.volume = this.volume * volumeScale;
            audioSource.src = clip.nativeUrl; 
            audioSource.loop = false;
            audioSource.play();
            audioSource.onEnded(()=>{
                audioSource.destroy()
                // console.log("===audioSource.onEnded===", objId, this.m_effectSourceMap.size)
            })
        }
    }

}
