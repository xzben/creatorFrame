import * as cc from "cc";
import { GameWorld } from "../../../world/GameWorld";
import { AudioSourceBase, AudioState } from "./AudioSourceBase";

const { ccclass } = cc._decorator;

@ccclass("AudioSourceCom")
export class AudioSourceCom  extends AudioSourceBase{

    private m_audioSource : cc.AudioSource | null = null;

    get enabled(): boolean{
        if(this.m_audioSource){
            return this.m_audioSource.enabled;
        }
        return this._enabled;
    }
    set enabled(value: boolean){
        this._enabled = value;
        if(this.m_audioSource){
            this.m_audioSource.enabled = value;
        }
    }

    set clip(val: cc.AudioClip | null){
        this._clip = val;
        if(this.m_audioSource){
            this.m_audioSource.clip = val;
        }
    }

    get clip(): cc.AudioClip | null{
        if(this.m_audioSource){
            return this.m_audioSource.clip;
        }
        return this._clip;
    }

    set loop(val: boolean){
        this._loop = val;
        if(this.m_audioSource){
            this.m_audioSource.loop = val;
        }
    }

    get loop(): boolean{
        if(this.m_audioSource){
            return this.m_audioSource.loop;
        }
        return this._loop;
    }
    
    set playOnAwake(val: boolean){
        this._playOnAwake = val;
        if(this.m_audioSource){
            this.m_audioSource.playOnAwake = val;
        }
    }

    get playOnAwake(): boolean{
        if(this.m_audioSource){
            return this.m_audioSource.playOnAwake;
        }
        return this._playOnAwake;
    }

    set volume(val: number){
        this._volume = val;
        if(this.m_audioSource){
            this.m_audioSource.volume = val;
        }
    }
    get volume(): number{
        if(this.m_audioSource){
            return this.m_audioSource.volume;
        }
        return this._volume;
    }

    get state(){
        if(this.m_audioSource){
            let state : any = this.m_audioSource.state;
            return state;
        }
        return this._state;
    }

    init(){
        super.init();
        console.log("############# AudioSourceCom:init()")
        this.m_audioSource = GameWorld.getInstance().getAudioSource();
    }

    
    play(): void{
        super.play();
        if(this.m_audioSource){
            this.m_audioSource.play();
        }
    }
    
    pause(): void{
        super.pause();
        if(this.m_audioSource){
            this.m_audioSource.enabled = false;
            this.m_audioSource.pause();
        }
    }

    resume(): void{
        super.resume();
        if (this.m_audioSource) {
            this.m_audioSource.enabled = true;
            this.m_audioSource.play();  
        }
    }

    stop(): void{
        super.stop();
        if(this.m_audioSource){
            this.m_audioSource.enabled = false;
            this.m_audioSource.volume = 0;
            this.m_audioSource.loop = false;
            this.m_audioSource.stop();
            this.m_audioSource.clip = null;
        }
    }

    playOneShot(clip: cc.AudioClip, volumeScale?: number): void{
        if(this.m_audioSource){
            this.m_audioSource.playOneShot(clip, volumeScale);
        }
    }

}
