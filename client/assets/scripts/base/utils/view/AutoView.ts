// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import * as cc from 'cc';
const { ccclass } = cc._decorator;

type AutoViewCallback = (...param : any)=>void;

@ccclass("AutoView")
export class AutoView extends cc.Component{
    protected m_openCallback : AutoViewCallback | null = null;
    protected m_closeCallback : AutoViewCallback | null = null;

    public setOpenCallback(openCallback:AutoViewCallback){
        this.m_openCallback = openCallback;
    }

    
    public setCloseCallback(closeCallback:AutoViewCallback){
        this.m_closeCallback = closeCallback;
    }

    start(){
        if(this.m_openCallback != null) this.m_openCallback();
    }

    onDestroy(){
        if(this.m_closeCallback != null) this.m_closeCallback();
    }

}
