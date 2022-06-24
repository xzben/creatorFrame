/*
 * @Author: xzben
 * @Date: 2022-05-25 11:41:46
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 11:54:12
 * @Description: file content
 */
import * as cc from 'cc';
import { LocalizadManager, LANGUAGE_EVENT, LANGUAGE_TYPE } from './LocalizedManager';
const { ccclass, property } = cc._decorator;

@ccclass('LocalizadLabel')
export class LocalizadLabel extends cc.Component {

    protected m_originString : string = null!;
    protected m_label : cc.Label = null!;

    public get string() : string{
        return this.m_label.string;
    }

    public set string( value : string){
        this.m_originString = value;
        this.m_label.string = LocalizadManager.getInstance().getLabelString(value);;
    }

    protected onLoad(){
        this.m_label = this.getComponent(cc.Label)!;
        
        this.m_originString = this.m_label.string;
        this.updateString();
        LocalizadManager.getInstance().addListener(LANGUAGE_EVENT.UPDATE, this, this.updateString);
    }

    protected onDestroy(){
        LocalizadManager.getInstance().removeListener(LANGUAGE_EVENT.UPDATE, this, this.updateString);
        super.onDestroy && super.onDestroy();
    }

    protected updateString(){
        this.m_label.string = LocalizadManager.getInstance().getLabelString(this.m_originString);
    }
}