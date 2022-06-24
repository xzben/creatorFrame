/*
 * @Author: xzben
 * @Date: 2022-05-25 11:41:46
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 11:54:04
 * @Description: file content
 */
import * as cc from 'cc';
import { LocalizadManager, LocalizedConfigJsonData  } from './LocalizedManager';
const { ccclass, property } = cc._decorator;

@ccclass('LocalizedConfigJson')
export class LocalizedConfig extends cc.Component {
    @property({
        type : cc.JsonAsset,
        tooltip : "",
        displayName : "english Label File",

    })
    private m_english : cc.JsonAsset = null!;

    @property({
        type : cc.JsonAsset,
        tooltip : "",
        displayName : "chiness Label File",

    })
    private m_chiness : cc.JsonAsset = null!;

    onLoad(){
        LocalizadManager.getInstance().pushConfig(new LocalizedConfigJsonData(this.name, {
            chiness : this.m_chiness.json,
            english : this.m_english.json,
        }));
    }
}