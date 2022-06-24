/*
 * @Author: xzben
 * @Date: 2022-05-25 12:04:29
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-13 15:27:31
 * @Description: file content
 */

import * as cc from 'cc';
import { ResLoader, SceneMgr, ServiceMgr } from '../../base/core';
import { BaseService } from '../../base/frame';
import { utils } from '../../base/utils/utils';
import { PlayerService } from '../player/PlayerService';
import { BattleLauchEvent } from './event/BattleLauchEvent';
import { BattleSetting, HeroLauchInfo } from './model/LauchModel';
const { ccclass, property } = cc._decorator;

interface GameLauchConfig
{
    scene : number;
    launch : string;
}

const GameIdConfig : { [ scene : number ] : string } = {
    [1] : "battle#config/launch/base_battle.json",
}

@ccclass('GameService')
export class GameService extends BaseService {
    public static getInstance() : GameService{
        return ServiceMgr.getService("GameService", GameService);
    }

    public startGame( scene : number )
    {
        let luachfile : string = GameIdConfig[scene];    

        this.runGameScene(scene, luachfile)
    }

    public getBattleSetting(): BattleSetting {
        return {}
    }
    private runGameScene( scene : number, luachfile : string)
    {
        utils.LoadingView.show("loading battle");
        let heros : HeroLauchInfo[] = [];
        heros.push(PlayerService.getInstance().getBattleHeroInfo());


        SceneMgr.getInstance().loadRunScene("battle#BattleLauch", ( success : boolean, scene ?: cc.Scene)=>{
            utils.LoadingView.close();
            if(success){
                scene.emit(BattleLauchEvent.LoadingBattleSceneStart, {
                    scene : scene,
                    lauch : luachfile,
                    randomseed : utils.randomInt(1, 1000000),
                    heros : heros,
                    setting : this.getBattleSetting(),
                });
            }else{
                utils.MsgBox.showConfirm("加载异常,请重新点击进入游戏");
            }
        })
    }
}