import  * as cc from 'cc';
import { ResLoader } from '../core/ResLoader';
import { LocalizadManager, LANGUAGE_EVENT, LANGUAGE_TYPE } from './LocalizedManager';
const { ccclass, property } = cc._decorator;

@ccclass('LocalizadSprite')
export class LocalizadSprite extends cc.Component {
    protected m_frameName : string = null!;
    protected m_resLoad : ResLoader = new ResLoader();
    protected m_sprite : cc.Sprite = null!;
    protected m_originSpriteFrame : cc.SpriteFrame = null!;

    @property({
        displayName : "使用配置表控制",
    })
    protected m_useConfig : boolean = true;


    @property({
        type: cc.SpriteFrame,
        displayName : "英语对应图片",
        visible : function() : boolean{
            let obj : any = this;
            return !obj.m_useConfig;
        },
    })
    protected m_enSprite : cc.SpriteFrame = null!;

    @property({
        type: cc.SpriteFrame,
        displayName : "中文对应图片",
        visible : function() : boolean{
            let obj : any = this;
            return !obj.m_useConfig;
        },
    })
    protected m_zhSprite : cc.SpriteFrame = null!;

    protected onLoad(){
        super.onLoad && super.onLoad();
        this.m_sprite = this.getComponent(cc.Sprite)!;

        if(this.m_sprite.spriteFrame){
            this.m_frameName = this.m_sprite.spriteFrame.name;
            this.m_originSpriteFrame = this.m_sprite.spriteFrame;
            this.m_originSpriteFrame.addRef();
        }
        
        this.updateFrame();
        LocalizadManager.getInstance().addListener(LANGUAGE_EVENT.UPDATE, this, this.updateFrame);
    }
    protected onDestroy(){
        LocalizadManager.getInstance().removeListener(LANGUAGE_EVENT.UPDATE, this, this.updateFrame);
        this.m_resLoad.releaseAll();
        this.m_originSpriteFrame.decRef();
        super.onDestroy && super.onDestroy();
    }

    protected updateFrame(){
        if(this.m_useConfig){
            this.updateFrameByConfig();
        }else{
            this.updateFrameBySpriteFrame();
        }
    }

    protected getSpriteByLanguage( language : LANGUAGE_TYPE) : cc.SpriteFrame{
        let spriteFrame : cc.SpriteFrame = this.m_originSpriteFrame;

        switch(language){
            case LANGUAGE_TYPE.EN:
                {
                    spriteFrame = this.m_enSprite;
                    break;
                }
            case LANGUAGE_TYPE.ZH:
                {
                    spriteFrame = this.m_zhSprite;
                    break;
                }
        }

        return spriteFrame;
    }

    protected updateFrameBySpriteFrame(){
        let language = LocalizadManager.getInstance().getLanauge();
        this.m_sprite.spriteFrame = this.getSpriteByLanguage(language);
    }

    protected updateFrameByConfig(){
        let spriteConfig = LocalizadManager.getInstance().getSprite(this.m_frameName);
        if(spriteConfig ){
            this.m_resLoad.pushStackAssets();
            spriteConfig.loadSprite(this.m_resLoad, ( sprite : cc.SpriteFrame | null)=>{
                if(sprite){
                    this.m_sprite.spriteFrame = sprite;
                }else{
                    this.m_sprite.spriteFrame = this.m_originSpriteFrame
                }
                this.m_resLoad.popReleaseStackAssets();
            })
        }
    }
}