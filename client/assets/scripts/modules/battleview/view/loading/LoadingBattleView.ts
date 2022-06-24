/*
 * @Author: xzben
 * @Date: 2022-06-06 18:23:55
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-06 20:33:24
 * @Description: file content
 */
import * as cc from 'cc';
import { BattleBaseComponent } from '../../common/BattleBaseComponent';
import { BattleLauchEvent } from '../../event/BattleLauchEvent';
import { MatchData } from '../../model/modelDefine';
const { ccclass, property } = cc._decorator;

@ccclass('LoadingBattleView')
export class LoadingBattleView extends BattleBaseComponent {
    onLoad()
    {
        this.node.active = false;
        this.addBattleEventListener(BattleLauchEvent.BattleMatchDone, this.handleMatchDone, this)
    }

    handleLoadingProcess( )
    {

    }

    handleLoadingDone()
    {
        
    }

    handleMatchDone( matchData : MatchData)
    {
        this.node.active = true;
    }

    start() {

    }
}