/*
 * @Author: xzben
 * @Date: 2022-06-06 18:23:55
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-13 14:53:47
 * @Description: file content
 */
import * as cc from 'cc';
import { BaseView } from '../../../base/frame';
import { BattleLauchEvent } from '../event/BattleLauchEvent';
const { ccclass, property } = cc._decorator;

@ccclass('BattleBaseComponent')
export class BattleBaseComponent extends BaseView {
    
    public addBattleEventListener(event : BattleLauchEvent, func : Function, target : unknown)
    {
        let curScene = cc.director.getScene()!;
        curScene.on(event, func, target );
    }
    
    public dispatchEvent( event : BattleLauchEvent, ... param : any[])
    {
        let curScene = cc.director.getScene()!;
        curScene.emit(event, ...param );
    }

    protected start() {

    }
}