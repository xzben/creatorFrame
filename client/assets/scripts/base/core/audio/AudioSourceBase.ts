import * as cc from "cc";

const { ccclass } = cc._decorator;

export enum AudioState {
    INIT = 0,
    PLAYING = 1,
    PAUSED = 2,
    STOPPED = 3,
    INTERRUPTED = 4
}

@ccclass("AudioSourceBase")
export class AudioSourceBase{
    protected _loop: boolean = false;
    protected _volume: number = 1;
    protected _clip: cc.AudioClip | null = null;
    protected _playOnAwake: boolean = false;
    protected _enabled: boolean = false;
    protected _state: AudioState = AudioState.INIT;

    get enabled(): boolean{
        return this._enabled;
    }
    set enabled(value: boolean){
        this._enabled = value;
    }

    set clip(val: cc.AudioClip | null){
        this._clip = val;
    }
    get clip(): cc.AudioClip | null{
        return this._clip;
    }

    set loop(val: boolean){
        this._loop = val;
    }
    get loop(): boolean{
        return this._loop;
    }
    
    set playOnAwake(val: boolean){
        this._playOnAwake = val;
    }
    get playOnAwake(): boolean{
        return this._playOnAwake;
    }

    set volume(val: number){
        this._volume = val;
    }
    get volume(): number{
        return this._volume;
    }

    get state(){
        return this._state;
    }
    
    init(){
        this._state = AudioState.INIT;
    }
    
    play(): void{
        this._state = AudioState.PLAYING;
    }
    
    pause(): void{
        this._state = AudioState.PAUSED;
    }

    resume(): void{
        this._state = AudioState.PLAYING;
    }

    stop(): void{
        this._state = AudioState.STOPPED;
    }


    playOneShot(clip: cc.AudioClip, volumeScale?: number): void{

    }

    isPause(){
        return this._state == AudioState.PAUSED;
    }

}
