/*
 * @Author: xzben
 * @Date: 2022-05-25 11:41:46
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 11:54:08
 * @Description: file content
 */
import * as cc from 'cc';
import { LocalizadManager, LocalizedConfigPathData  } from './LocalizedManager';
const { ccclass, property } = cc._decorator;

@ccclass('LocalizedConfigPath')
export class LocalizedConfigPath extends cc.Component {
    @property({
        tooltip : "",
        displayName : "english Label File",

    })
    private m_english : string = null!;

    @property({
        tooltip : "",
        displayName : "chiness Label File",

    })
    private m_chiness : string = null!;

    onLoad(){
        LocalizadManager.getInstance().pushConfig(new LocalizedConfigPathData(this.name, {
            chiness : this.m_chiness,
            english : this.m_english,
        }));
    }
}