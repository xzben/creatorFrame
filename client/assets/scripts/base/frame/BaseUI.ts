/*
 * @Author: xzben
 * @Date: 2022-05-25 11:41:09
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 11:52:37
 * @Description: file content
 */
import * as cc from 'cc';
import { ResLoader } from "../core/ResLoader"
import { EventDispatcher } from './EventDispatcher';
const { ccclass } = cc._decorator;

export type DoneFunc = (...parameters:any)=>void;

@ccclass("BaseUI")
export class BaseUI extends cc.Component{
    protected m_listenerDispatchers : Map<number, EventDispatcher> = new Map;
    protected m_resLoader = new ResLoader();
    private   m_spriteLoadingPath : any = {};


    public on(dispatch : EventDispatcher, event : any, funcName : string, count : number = -1, order : number = 0){
        let handler = (this as any)[funcName];
        if(typeof(handler) != "function")
        {
            console.error("the funcName:%s is not valid", funcName);
            return;
        }

        dispatch.addListener(event, this, handler, count, order);
        this.m_listenerDispatchers.set(dispatch.getId(), dispatch);
    }
    public once( dispatch : EventDispatcher, event : any, funcName : string, order : number = 0){
        this.on(dispatch, event, funcName, 1, order);
    }

    public clearEvents(){
        this.m_listenerDispatchers.forEach(( dispatch : EventDispatcher )=>{
            dispatch.removeListenerByOwner(this);
        })
        this.m_listenerDispatchers.clear();
    }

    protected onDisable(){
        this.m_listenerDispatchers.forEach((dispatch : EventDispatcher)=>{
            dispatch.pauseListenerByOwner(this);
        })
    }

    protected onEnable(){
        this.m_listenerDispatchers.forEach((dispatch : EventDispatcher)=>{
            dispatch.resumeOwner(this);
        })
    }

    public onDestroy(){
        this.clearEvents();
        this.m_resLoader.releaseAll();
    }

    public updateSprite( sp : cc.Sprite | cc.Mask, path : string, resLoader ?: ResLoader, doneCall ?: DoneFunc){
        if(resLoader == null){
            resLoader = this.m_resLoader;
        }
        this.m_spriteLoadingPath[sp.uuid] = path;
        resLoader.loadSpriteFrame(path, ( err , frame : cc.SpriteFrame )=>{
            if(sp && cc.isValid(sp) && cc.isValid(sp.node) && this.m_spriteLoadingPath[sp.uuid] == path ){
                sp.spriteFrame = frame;
                doneCall && doneCall();
            }
        })
    }
}
