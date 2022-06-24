import * as cc from "cc";
import { GameWorld } from "../../world/GameWorld";
import { platform } from "../platform/platform";
import { AudioEngine } from "./audio/AudioEngine";
import { AudioSourceBase } from "./audio/AudioSourceBase";
import { SceneMgr } from "./SceneMgr";
import { StoreMgr } from "./StoreMgr";

const { ccclass } = cc._decorator;

interface SoundConfigAPI {
    getSoundConfig(soundName : string,  callback : (success : boolean, value : any)=>void ) : void;
}

@ccclass("SoundMgr")
export class SoundMgr{
    public static s_instance : SoundMgr | null = null;
    public static getInstance(){
        if(this.s_instance == null){
            this.s_instance = new SoundMgr();
            this.s_instance.init()
        }
        return this.s_instance;
    }
    
    private m_musicVolume = 1.0;
    private m_effectVolume = 1.0;
    private m_isMusicOpen = true;
    private m_isEffectOpen = true;
    private m_lastMusicFile : string  = null!;
    private m_audioSource : AudioSourceBase | null = null;
    private m_getConfigInterface : SoundConfigAPI = null!;
    private m_isShockOpen = true;
    private m_isHDOpen = true;

    playHallBgMusic(){
        this.playMusicByName("hallbg")
    }

    playBattleBgMusic(){
        this.playMusicByName("battlebg")
    }

    getDefaultHDStatus(){
        return true;
        // let openHD = false;

        // if( cc.sys.isNative ||
        //     cc.sys.Platform.DESKTOP_BROWSER == cc.sys.platform
        // )
        // {
        //     openHD = true;
        // }

        // return openHD;
    }

    public init()
    {
        this.m_isMusicOpen = StoreMgr.getInstance().getBoolValue("MUSIC_OPEN", true)
        this.m_isEffectOpen = StoreMgr.getInstance().getBoolValue("EFFECT_OPEN", true)
        this.m_musicVolume = StoreMgr.getInstance().getFloatValue("MUSIC_VOLUME", 1)
        this.m_effectVolume = StoreMgr.getInstance().getFloatValue("EFFECT_VOLUME", 1)
        this.m_isShockOpen = StoreMgr.getInstance().getBoolValue("SHOCK_OPEN", true)
        this.m_isHDOpen = StoreMgr.getInstance().getBoolValue("HD_OPEN", this.getDefaultHDStatus())

        this.setMusicVolume(this.m_musicVolume)
        this.setEffectVolume(this.m_effectVolume)

        cc.game.on(cc.Game.EVENT_HIDE, this.handleHide, this);
        cc.game.on(cc.Game.EVENT_SHOW, this.handleShow, this);
        this.m_audioSource = AudioEngine.getInstance();
    }

    public handleHide(){
        console.log("handleHide")
        this.pauseMusic();
    }

    public handleShow(){
        console.log("handleShow")
        GameWorld.getInstance().scheduleOnce(()=>{
            if(this.isMusicOpen()){
                this.resumeMusic();
            }else{
                this.stopMusic();
            }
        }, 0)
    }

    public setSoundConfigInterface( inter : SoundConfigAPI){
        this.m_getConfigInterface = inter;
    }
    
    private doPlayEffect(clip : cc.AudioClip)
    {
        if(this.m_audioSource)
        {
            this.m_audioSource.playOneShot(clip, this.m_effectVolume);
        }
    }

    private doPlayMusic( clip : cc.AudioClip )
    {   
        if(!this.isMusicOpen())
            return false;

        if(this.m_audioSource)
        {
            console.log("doPlayMusic", this.m_musicVolume, clip);
            this.m_audioSource.stop();
            this.m_audioSource.enabled = true;
            this.m_audioSource.volume = this.m_musicVolume;
            this.m_audioSource.clip = clip;
            this.m_audioSource.loop = true;
            this.m_audioSource.play();
        }
    }

    setMusicOpen( open : boolean )
    {
        this.m_isMusicOpen = open;
        StoreMgr.getInstance().setBoolValue("MUSIC_OPEN", open)
        if (this.m_isMusicOpen == true){
            this.resumeMusic()
        }else{
            this.pauseMusic()
        }
    }

    setEffectOpen( open : boolean )
    {
        this.m_isEffectOpen = open;
        StoreMgr.getInstance().setBoolValue("EFFECT_OPEN", open)
    }

    setMusicVolume( volume : number )
    {
        this.m_musicVolume = volume;
        StoreMgr.getInstance().setFloatValue("MUSIC_VOLUME", volume)
    }

    setEffectVolume( volume : number )
    {
        this.m_effectVolume = volume;
        StoreMgr.getInstance().setFloatValue("EFFECT_VOLUME", volume)
    }

    isMusicOpen()
    {
        return this.m_isMusicOpen
    }

    playMusicByName(soundName : string){
        this.m_getConfigInterface.getSoundConfig(soundName, (success : boolean, value : any)=>{
            if (success) {
                this.playMusic(value.path);
            }
        })
    }

    playMusic( file : string)
    {
        if(file == null || file == "") return;
        this.m_lastMusicFile = file;
        if(!this.isMusicOpen())
            return false;

        SceneMgr.getInstance().getSceneResLoader().loadAudioClip(file, (err, asset)=>{
            if(err){
                cc.error(err.message || err);
                return;
            }
            if(this.m_lastMusicFile == file){
                let audio = asset as cc.AudioClip;
                this.doPlayMusic(audio);
            }
        });
        return true;
    }
    
    pauseMusic()
    {
        if(this.m_audioSource)
        {
            this.m_audioSource.pause();
        }
    }

    resumeMusic()
    {
        if( !this.m_isMusicOpen)
            return;
        if(this.m_audioSource && this.m_audioSource.isPause()){
            this.m_audioSource.resume();
        }else{
            this.playMusic(this.m_lastMusicFile);
        }
    }

    stopMusic()
    {
        if(this.m_audioSource){
            this.m_audioSource.stop();
        }
    }

    isEffectOpen()
    {
        return this.m_isEffectOpen
    }

    playEffectByName(soundName : string){
        if(!this.isEffectOpen())
            return;

        this.m_getConfigInterface.getSoundConfig(soundName, (success : boolean, value : any)=>{
            if (success) {
                this.playEffect(value.path);
            }else{
                console.error("can't find soundName:", soundName)
            }
        })
    }

    playEffect( file : string)
    {
        if(!this.isEffectOpen())
            return false;

        SceneMgr.getInstance().getSceneResLoader().loadAudioClip(file, (err, asset)=>{
            // console.log("loadAudioClip", file, err, asset)
            let audio = asset as cc.AudioClip;
            if(err){
                cc.error(err.message || err);
                return;
            }
            this.doPlayEffect(audio);
        })

        return true;
    }

    isShockOpen()
    {
        return this.m_isShockOpen
    }
    
    setShockOpen( open : boolean )
    {
        this.m_isShockOpen = open;
        StoreMgr.getInstance().setBoolValue("SHOCK_OPEN", open)
    }

    setHDOpen( open : boolean){
        this.m_isHDOpen = open;
        StoreMgr.getInstance().setBoolValue("HD_OPEN", open)
    }

    isHDOpen(){
        return this.m_isHDOpen;
    }

    playShock( ms : number = 500){
        if(!this.isShockOpen())
            return false;

        platform.getInstance().vibrator(ms);
    }
}
