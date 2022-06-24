
import * as cc from 'cc';
const { ccclass, property } = cc._decorator;

export enum AutoNodeEvent{
    ON_LOAD,
    ON_START,
    ON_DESTROY,

    ON_ENABLE,
    ON_DISABLE,
}
export type AutoNodeEventCallback = ( event : AutoNodeEvent)=>void;

@ccclass('AutoNode')
export class AutoNode extends cc.Component {
    private m_callback : AutoNodeEventCallback = null!;

    setCallback( callback : AutoNodeEventCallback){
        this.m_callback = callback;
    }

    onLoad(){
        this.m_callback && this.m_callback(AutoNodeEvent.ON_LOAD);
    }

    start () {
        this.m_callback && this.m_callback(AutoNodeEvent.ON_START);
    }

    onDestroy(){
        this.m_callback && this.m_callback(AutoNodeEvent.ON_DESTROY);
    }

    onEnable(){
        this.m_callback && this.m_callback(AutoNodeEvent.ON_ENABLE);
    }

    onDisable(){
        this.m_callback && this.m_callback(AutoNodeEvent.ON_DISABLE);
    }
}