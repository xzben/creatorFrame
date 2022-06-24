import * as cc from 'cc';
import { ResLoader } from '../core/ResLoader';
import { EventDispatcher } from '../frame/EventDispatcher';
import { log } from '../log/log';
const { ccclass } = cc._decorator;

export enum LANGUAGE_TYPE{
    ZH  = 1,  //中文
    EN  = 2,  //英文
};

export const LANGUAGE_DEFAULT = LANGUAGE_TYPE.ZH;

export enum LANGUAGE_EVENT{
    UPDATE = 1, //文本更新
}

export abstract class LocalizedConfigData{
    private m_configName : string = null!;
    constructor( name : string){
        this.m_configName = name;
    }
    public getConfigName() : string {
        return this.m_configName;
    }
    public  abstract loadData( loader : ResLoader, language : LANGUAGE_TYPE,doneCallback : ( labelMap : any, spriteMap : any)=>void ) : void;
}

export class LocalizedConfigPathData extends LocalizedConfigData{
    private m_chiness : string = null!;
    private m_english : string = null!;

    constructor( name : string, { chiness, english  } : { chiness : string, english : string}){
        super(name);
        this.m_chiness = chiness;
        this.m_english = english;
    }
    
    private getFile( language : LANGUAGE_TYPE ) : string{
        switch(language){
            case LANGUAGE_TYPE.EN:
                return this.m_english;
            case LANGUAGE_TYPE.ZH:
                return this.m_chiness;
            default:
                return this.m_english;
        }
    }

    public loadData( loader : ResLoader, language : LANGUAGE_TYPE,doneCallback : ( labelMap : any, spriteMap : any)=>void){
        loader.LoadJsonAsset(this.getFile(language), (error : Error | null, data : cc.JsonAsset)=>{
                if(error || data == null){
                    log.e("load assets failed", error?.message);
                    doneCallback( null, null);
                }else if(data.json){
                    let mapData : any = data.json;
                    let labelMap : any = mapData["label"];
                    let spriteMap : any = mapData["sprite"];
                    doneCallback(labelMap, spriteMap);
                }
        })
    }
}

export class LocalizedConfigJsonData extends LocalizedConfigData{
    private m_chiness : any = null!;
    private m_english : any = null!;

    constructor( name : string, { chiness, english  } : { chiness : any, english : any}){
        super(name);
        this.m_chiness = chiness;
        this.m_english = english;
    }
    
    private getOriginData( language : LANGUAGE_TYPE) : any{
        switch(language){
            case LANGUAGE_TYPE.EN:
                return this.m_english;
            case LANGUAGE_TYPE.ZH:
                return this.m_chiness;
            default:
                return this.m_english;
        }
    }

    public loadData( loader : ResLoader, language : LANGUAGE_TYPE,doneCallback : ( labelMap : any, spriteMap : any)=>void){
        let origin = this.getOriginData(language);
        let mapData : any = origin;
        let labelMap : any = mapData["label"];
        let spriteMap : any = mapData["sprite"];
        doneCallback(labelMap, spriteMap);
    }
}

export class SpriteFrameConfig{
    private m_altas : string = null!;
    private m_name : string = null!;

    constructor( param : string | object){
        if(typeof(param) == "string"){
            this.m_name = param;
        }

        if(typeof(param) == "object"){
            this.m_altas = (param as any)["altas"];
            this.m_name = (param as any)["sprite"];
        }
    }

    loadSprite( loader : ResLoader, doneCallback : ( sprite : cc.SpriteFrame | null)=>void){
        if(this.m_altas){
            loader.loadSpriteAtlas(this.m_altas, ( error : Error | null, alts : cc.SpriteAtlas)=>{
                if(error == null && alts){
                    log.d("loadSpriteAtlas", alts, alts.getSpriteFrames());
                    doneCallback(alts.getSpriteFrame(this.m_name));
                }else{
                    log.e(error)
                    doneCallback(null);
                }
            })
        }else{
            loader.loadSpriteFrame(this.m_name, (error : Error | null, sprite : cc.SpriteFrame)=>{
                if(error == null && sprite){
                    doneCallback(sprite);
                }else{
                    log.e(error)
                    doneCallback(null);
                }
            })
        }
    }

}

type LOAD_MAP_COMPELETE_FUNC = ()=>void;

@ccclass('LocalizadManager')
export class LocalizadManager extends EventDispatcher{
    private static s_instance : LocalizadManager = null!;
    public static getInstance() : LocalizadManager{
        if(this.s_instance == null){
            this.s_instance = new LocalizadManager();
        }
        return this.s_instance;
    }

    private m_labelMap : Map<string, string> = new Map();
    private m_spriteMap : Map<string, SpriteFrameConfig> = new Map();

    private m_resLoad : ResLoader = new ResLoader();
    private m_language : LANGUAGE_TYPE = LANGUAGE_DEFAULT;
    private m_configs : Array<LocalizedConfigData> = new Array;
    private m_configFilter : Map<string, boolean> = new Map;

    public getLanauge() : LANGUAGE_TYPE{
        return this.m_language;
    }

    public pushConfig( config : LocalizedConfigData ){
        if(this.m_configFilter.has(config.getConfigName())){
            return;
        }
        this.m_configFilter.set(config.getConfigName(), true);
        this.m_configs.push(config);
        
        this.loadMap(config, ()=>{
            this.dispatch(LANGUAGE_EVENT.UPDATE);
        });
    }

    public switchLanguage( language : LANGUAGE_TYPE){
        if(this.m_language == language) return;
        this.m_language = language;
        this.reloadConfigs(()=>{
            log.d("switchLanguage done")
            this.dispatch(LANGUAGE_EVENT.UPDATE);
        });
    }

    private reloadConfigs( doneCallback : LOAD_MAP_COMPELETE_FUNC){
        let count = this.m_configs.length;
        let loadedCount = 0;
        for(let i = 0; i < count; i++){
            let config = this.m_configs[i];
            this.loadMap(config, ()=>{
                loadedCount++;
                if(loadedCount >= count){
                    doneCallback();
                }
            });
        }
    }

    private setLabelMap( key : string, value : string){
        this.m_labelMap.set(key, value);
    }

    private setSpriteMap( key : string, value : SpriteFrameConfig){
        this.m_spriteMap.set(key, value);
    }

    private loadMap( config : LocalizedConfigData, doneCallback : LOAD_MAP_COMPELETE_FUNC ){
        config.loadData(this.m_resLoad, this.m_language, ( labelMap : any, spriteMap : any)=>{
            if(labelMap){
                for(let key in labelMap){
                    let value = labelMap[key];
                    this.setLabelMap(key, value);
                }
            }

            if(spriteMap){
                for(let key in spriteMap){
                    let value = spriteMap[key];
                    this.setSpriteMap(key, new SpriteFrameConfig(value));
                }
            }

            doneCallback();
        })
    }

    public getLabelString( key : string) : string{
        return this.m_labelMap.get(key) || key;
    }

    public getSprite(key : string) : SpriteFrameConfig | null{
        let ret = this.m_spriteMap.get(key)
        if(ret == null)
            return null;

        return  ret;
    }
}