import * as cc from 'cc';
import { UIMgr } from '../core/UIMgr';
import { ResLoader } from "../core/ResLoader"
import { EventDispatcher } from './EventDispatcher';
import { utils } from '../utils/utils';
const { ccclass } = cc._decorator;

type BaseViewCloseCallback = ()=>void;
type ScheduleCallback = ()=>void;

@ccclass("BaseView")
export class BaseView extends cc.Component{
    protected m_closeCallback : BaseViewCloseCallback | null = null;
    protected   m_viewId = -1;
    protected m_listenerDispatchers : Map<number, EventDispatcher> = new Map;
    protected   m_viewPath = "";
    protected m_resLoader = new ResLoader();
    protected   m_uidata : any = null!;
    protected   m_isstarted : boolean = false;
    protected   m_spriteLoadingPath : any = {};
    
    public setUIData( data : any){
        this.m_uidata = data;
        if(this.m_isstarted){
            this.onUpdateData(data);
        }
    }

    public onUpdateData( params : any){

    }

    public setViewInfo( id : number, path : string){
        this.m_viewId = id;
        this.m_viewPath = path;
    }

    public getViewPath(){
        return this.m_viewPath;
    }
    
    public showAnim( doneCallback : ()=>void){
        doneCallback();
    }

    public closeAnim( doneCallback : ()=>void){
        doneCallback();
    }
    
    public close(){
        // console.log("baseView close");
        UIMgr.getInstance().closeView(this.m_viewId);
    }

    public setLocalZOrder( zorder : number){
        utils.setUILocalZOrder(this.node, zorder);
    }

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

    protected onDestroy(){
        this.clearEvents();
        if(this.m_closeCallback != null) this.m_closeCallback();
        if(this.m_resLoader) this.m_resLoader.releaseAll();
        UIMgr.getInstance().clearView(this.m_viewId);
    }

    public setCloseCallback( callback : BaseViewCloseCallback ){
        this.m_closeCallback = callback;
    }
    
    protected start(){
        this.m_isstarted = true;
        this.checkAddBlockNode();
        if(this.m_uidata != null){
            this.onUpdateData(this.m_uidata);
        }
    }

    protected onLoad(){

    }
    
    public updateSprite( sp : cc.Sprite, path : string){
        this.m_spriteLoadingPath[sp.uuid] = path;
        this.m_resLoader.loadSpriteFrame(path, ( err , frame : cc.SpriteFrame )=>{
            if(sp && cc.isValid(sp) && cc.isValid(sp.node) && this.m_spriteLoadingPath[sp.uuid] == path)
                sp.spriteFrame = frame;
        })
    }

    protected checkAddBlockNode(){
        let block = this.node.getComponent(cc.BlockInputEvents)
        if(block == null){
            this.node.addComponent(cc.BlockInputEvents);
        }
    }
}
