import * as cc from 'cc';
import { SceneMgr } from '../base/core/SceneMgr';
import { Network } from '../base/net/Network';
import { log}  from "../base/log/log"
import { utils } from '../base/utils/utils';
import { platform } from '../base/platform/platform';
import { EventDispatcher, EventType, ListenerFunc, EventListener } from '../base/frame/EventDispatcher';
import { ResLoader, SoundMgr } from '../base/core';
import { ENV, setCurEnv } from '../config/Env';
import { BundleAsset } from '../../launch/BaseLoader';
import { ConfigService } from '../modules/common/ConfigService';

const { ccclass, property, requireComponent } = cc._decorator;

export const enum GlobalEvent{
    UPDATE_FINISH,
    UPDATE_PROCESS,
    UPDATE_NEED_UPDATE,
    UPDATE_ERROR,
    INIT_UPDATE_MANIFEST,
}

@ccclass('GameWorld')
@requireComponent(cc.AudioSource)
export class GameWorld extends cc.Component {
    private static s_instance : GameWorld | null = null;
    
    public static getInstance() : GameWorld{
        if(this.s_instance == null){
            console.error("GameWorld getInstance null")
        }

        return this.s_instance;
    }

    private m_audioSource : cc.AudioSource | null = null;
    private m_eventDispatcher : EventDispatcher = new EventDispatcher();

    public m_gameEnv : ENV = null!;

    @property({
        displayName : "是否开启广告", 
    })
    private m_openAd : boolean = true;

    @property({
        displayName: "广告跳过提示",
        visible(){
            let obj : any = this;
            return !obj.m_openAd;
        },
    })
    private m_filterAdTips : string = "广告尚未接入，当前直接跳过广告!";


    public m_loadingBar : cc.ProgressBar = null!;
    public m_lblProcess : cc.Label = null!;
    public m_globalResLoader : ResLoader = new ResLoader();

    getAudioSource() : cc.AudioSource | null
    {
        return this.m_audioSource;
    }


    getGlobalResLoader() : ResLoader{
        return this.m_globalResLoader;
    }

    getCurEnv() : ENV{
        return this.m_gameEnv;
    }

    getIsOpenAd():boolean{
        return this.m_openAd;
    }

    getFilterAdTips():string{
        return this.m_filterAdTips;
    }

    initResourceSize(){
        let framesize = cc.view.getFrameSize();
        let mysize = cc.size(720, 1280);

        let ftmp = framesize.width/framesize.height;
        let rtmp = mysize.width/mysize.height;

        let resolutionSize = mysize.clone();
        if( ftmp > rtmp ){
            resolutionSize.height = mysize.height;
            resolutionSize.width = resolutionSize.height * framesize.width/framesize.height;
            
        }else{
            resolutionSize.width = mysize.width;
            resolutionSize.height = resolutionSize.width * framesize.height/framesize.width;  
        }
        cc.view.setDesignResolutionSize(resolutionSize.width, resolutionSize.height, cc.ResolutionPolicy.SHOW_ALL);
    }

    onLoad()
    {
        this.initResourceSize();
        this.m_audioSource = this.getComponent(cc.AudioSource);
        console.log("GameWorld cur env", this.m_gameEnv);
        setCurEnv(this.m_gameEnv);

        if(GameWorld.s_instance == null)
        {
            GameWorld.s_instance = this;
        }
        else
        {
            console.error("Gameworld is repeat load!");
        }

        cc.game.on(cc.Game.EVENT_HIDE, ()=>{
            //游戏切后台
            console.log("EVENT_GAME_HIDE")            
            SoundMgr.getInstance().pauseMusic();
        })

        cc.game.on(cc.Game.EVENT_SHOW, ()=>{
            //游戏切前台
            console.log("EVENT_GAME_SHOW");
            this.scheduleOnce(()=>{
                SoundMgr.getInstance().resumeMusic();
            }, 0.1)
        })
    }

    public addListenerOnce(event : EventType,  owner : Object, handler : ListenerFunc,) : EventListener {
        return this.m_eventDispatcher.addListenerOnce(event, owner, handler);
    }

    public addListener( event : EventType, owner : Object, handler : ListenerFunc,  count : number = -1, order : number = 0) : EventListener {
        return this.m_eventDispatcher.addListener(event, owner, handler, count, order);
    }

    public pauseListenerByOwner( owner : Object, event ?: EventType){
        return this.m_eventDispatcher.pauseListenerByOwner(owner, event);
    }
    
    public resumeOwner(owner : Object, event ?: EventType){
        return this.m_eventDispatcher.resumeOwner(owner, event);
    }

    public removeListenerByOwner( owner : Object, event ?: EventType){
        return this.m_eventDispatcher.removeListenerByOwner(owner, event);
    }

    public removeListenerByEvent( event : EventType){
        return this.m_eventDispatcher.removeListenerByEvent(event);
    }

    public removeListener( event : EventType,  owner : Object, handler : ListenerFunc){
        return this.m_eventDispatcher.removeListener(event, owner, handler);
    }

    public dispatch( event : EventType, ...datas : any[]) {
        return this.m_eventDispatcher.dispatch(event, ...datas);
    }

    public addListenerAll(owner : Object, func : ListenerFunc){
        return this.m_eventDispatcher.addListenerAll(owner, func);
    }

    public removeListenerAll(owner : Object, func : ListenerFunc){
        return this.m_eventDispatcher.removeListenerAll(owner, func);
    }

    public initUpdateManifest( doneCallback : ()=>void){
        if( cc.sys.isNative ){
            this.getGlobalResLoader().LoadAsset("project", ( err, asset : cc.Asset )=>{
                console.log("initUpdateManifest result project", );
                this.dispatch(GlobalEvent.INIT_UPDATE_MANIFEST, asset);
                doneCallback()
            })
        }else{
            doneCallback();
        }
    }

    start () {
        let global : any = globalThis;
        global.utils = utils;
        global.log = log;
        global.SoundMgr = SoundMgr;

        console.log(utils.parseGetParams());
        log.d("gameWorld start", cc.sys);
        log.d("os", cc.sys.os, cc.sys.isBrowser);
        log.d("platform", cc.sys.platform);
        this.initUpdateManifest(()=>{
            Network.getInstance().init(()=>{
                this.launchGame();
            })
        })
    }

    update(dt: number){
        Network.getInstance().update(dt);
    }

    restartGame(){
        platform.getInstance().restart();
    }
    
    launchGame(){
        this.m_loadingBar.progress = 0;
        this.m_lblProcess.string = `加载bundle资源中 0%`

        ResLoader.loadBundleArray(["common"], ( err : Error | null, bundles : Map<string, BundleAsset> | null )=>{
            if(bundles){
                bundles.forEach(( bundle )=>{
                    bundle.addRef(); //全局包不需要释放
                })
            }
            this.m_loadingBar.progress = 0;
            this.m_lblProcess.string = `加载配置表资源中 0%`

            ConfigService.getInstance().loadAllConfigs(()=>{
                this.m_loadingBar.progress = 0;
                this.m_lblProcess.string = `加载场景中 0%`
                SceneMgr.getInstance().loadRunScene("hall#hallScene", ()=>{
                    
                }, ( percent : number)=>{
                    this.m_loadingBar.progress = percent;
                    this.m_lblProcess.string = `加载场景中 ${Math.floor(percent*1000)/10}%`
                })
            }, ( percent : number)=>{
                this.m_loadingBar.progress = percent;
                this.m_lblProcess.string = `加载配置表资源中 ${Math.floor(percent*1000)/10}%`
            })
        })
    }
}

