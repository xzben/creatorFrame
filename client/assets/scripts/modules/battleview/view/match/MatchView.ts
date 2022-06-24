/*
 * @Author: xzben
 * @Date: 2022-06-06 18:23:55
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-06 20:38:04
 * @Description: file content
 */
import * as cc from 'cc';
import { BattleBaseComponent } from '../../common/BattleBaseComponent';
import { BattleLauchEvent } from '../../event/BattleLauchEvent';
import { MatchData } from '../../model/modelDefine';
const { ccclass, property } = cc._decorator;

@ccclass('MatchView')
export class MatchView extends BattleBaseComponent {
    
    onLoad()
    {
        this.node.active = true;
        this.addBattleEventListener(BattleLauchEvent.BattleStartMatch, this.handleStartMatch, this)
        this.addBattleEventListener(BattleLauchEvent.BattleMatchDone, this.handleMatchDone, this)
    }

    handleMatchDone( matchData : MatchData)
    {
        this.node.active  = false;
    }

    handleStartMatch()
    {

    }

    start() {

    }
}