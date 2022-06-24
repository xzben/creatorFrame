/*
 * @Author: xzben
 * @Date: 2022-05-25 11:33:56
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 16:49:44
 * @Description: file content
 */

import * as cc from 'cc';
import { BaseLoader } from './BaseLoader';
const { ccclass, property } = cc._decorator;

enum ENV {
    DEBUG,
    INNER_TEST,
    OUT_TEST,
    RELEASE,
}

@ccclass('Lauch')
export class Lauch extends cc.Component {
    @property(cc.ProgressBar)
    private m_loadingBar : cc.ProgressBar = null!;

    @property(cc.Label)
    private m_lblProcess : cc.Label = null!;

    @property({
        type : cc.Enum(ENV),
        displayName : "GameEnv",
        tooltip : "游戏发布环境",
    })
    private m_gameEnv : number = ENV.RELEASE;


    updateProcess(percent : number){
        this.m_lblProcess.string = `游戏加载中:${percent}%`
        this.m_loadingBar.progress = percent/100;
    }

    start () {
        let resload = new BaseLoader();
        this.updateProcess(0);
        cc.setDisplayStats(this.m_gameEnv != ENV.RELEASE);
        
        if(cc.sys.isMobile)
        cc.screen.requestFullScreen()

        BaseLoader.loadBundleArray(["scripts"], ()=>{
            resload.loadPrefab("scripts#world/GameWorld", ( err, prefab : cc.Prefab)=>{
                let node = cc.instantiate(prefab);
                let GameWorld : any = node.getComponent("GameWorld");
                GameWorld.m_loadingBar = this.m_loadingBar;
                GameWorld.m_lblProcess = this.m_lblProcess;
                GameWorld.m_gameEnv = this.m_gameEnv;
                cc.game.addPersistRootNode(node);
            })
        }, ( percent : number)=>{
            this.updateProcess(Math.floor(percent*100));
        })
    }
}
