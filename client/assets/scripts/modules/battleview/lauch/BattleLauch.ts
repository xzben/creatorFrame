/*
 * @Author: xzben
 * @Date: 2022-06-06 18:23:55
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-13 15:30:11
 * @Description: file content
 */
import * as cc from 'cc';
import { ResLoader, SceneMgr } from '../../../base/core';
import { BattleBaseComponent } from '../common/BattleBaseComponent';
import { BattleLauchEvent } from '../event/BattleLauchEvent';
import { JsonNamePath, LauchJsonConfig } from '../model/JsonDefineModel';
import { BattleSetting, HeroLauchInfo, LauchLogicConfig } from '../model/LauchModel';
const { ccclass, property } = cc._decorator;

type StartData = { scene : number, lauch : string, randomseed : number, setting : BattleSetting, heros : HeroLauchInfo[] }

@ccclass("LauchPrefabConfig")
class LauchPrefabConfig
{
    @property(cc.Prefab)
    public match : cc.Prefab = null!;

    @property(cc.Prefab)
    public loading : cc.Prefab = null!;
}

@ccclass('BattleLauch')
export class BattleLauch extends BattleBaseComponent{
    @property({
        type : LauchPrefabConfig,
    })
    private m_prefabConfig : LauchPrefabConfig = new LauchPrefabConfig();

    @property(cc.Canvas)
    private m_canvas : cc.Canvas = null!;

    private m_matching : cc.Node = null!;
    private m_loading  : cc.Node = null!;

    onLoad(){
        this.addBattleEventListener(BattleLauchEvent.BattleStartMatch, this.handleStartMatch, this);
        this.addBattleEventListener(BattleLauchEvent.BattleMatchDone, this.handleMatchDone, this);
        this.addBattleEventListener(BattleLauchEvent.LoadingBattleSceneStart, this.handleLoadingStart, this);
    }

    protected loadingJsonData( path : string, finish : ( json : any)=>void = null) : Promise<any>
    {
        return new Promise(( resolve, reject )=>{
            this.m_resLoader.LoadJsonAsset(path, ( error : Error, data : cc.JsonAsset)=>{
                if(error == null)
                {
                    resolve(data.json);
                    if(finish)
                    {
                        finish(data.json);
                    }
                    
                }
                else
                {
                    reject(error.message);
                }
            })
        })
    }

    private showMatchView()
    {
        if(this.m_matching != null) return;

        let node = cc.instantiate(this.m_prefabConfig.match);
        this.m_canvas.node.addChild(node);
        this.m_matching = node;
    }

    private hideMatchView()
    {
        if(this.m_matching)
        {
            this.m_matching.destroy();
            this.m_matching = null;
        }
    }

    private showLoadingView()
    {
        if(this.m_loading != null) return;
        this.m_loading = cc.instantiate(this.m_prefabConfig.loading);
        this.m_canvas.node.addChild(this.m_loading);
    }

    private nodeLoadingView()
    {
        if(this.m_loading)
        {
            this.m_loading.destroy();
            this.m_loading = null;
        }
    }

    protected handleStartMatch()
    {
        this.showMatchView();
    }

    protected handleMatchDone()
    {
        this.hideMatchView();
        this.showLoadingView();
    }

    protected async handleLoadingStart( startData : StartData)
    {
        let data : LauchJsonConfig = await this.loadingJsonData(startData.lauch);
        
        let loadlist = [];
        let lauchData : LauchLogicConfig = {
            engine : null,
            math : {},
            entitys : {},
            objects : {},
            special : {},
            ai : {},
        };
        
        let count = 0;

        let percentCall = ()=>{
            count++;
            let percent = count/loadlist.length;
            this.dispatchEvent(BattleLauchEvent.LoadingBattleConfigProcess, percent);
        }

        loadlist.push(this.loadingJsonData(data.engine, ( engine )=>{
            lauchData.engine = engine;
            percentCall();
        }));

        data.entitys.forEach(( item : JsonNamePath )=>{
            loadlist.push(this.loadingJsonData(item.path, ( temp )=>{
                lauchData.entitys[item.name] = temp;
                percentCall();
            }))
        })

        data.objects.forEach(( item : JsonNamePath )=>{
            loadlist.push(this.loadingJsonData(item.path, ( objects : any[])=>{
                for(let i = 0; i < objects.length; i++)
                {
                    let obj = objects[i];
                    lauchData.objects[obj.id] = obj
                }
                percentCall();
            }))
        })

        data.special.forEach((  item : JsonNamePath )=>{
            loadlist.push(this.loadingJsonData(item.name, ( temp )=>{
                lauchData.special[item.name] = temp;
                percentCall();
            }))
        })

        data.ai.forEach((  item : JsonNamePath )=>{
            loadlist.push(this.loadingJsonData(item.name, ( temp )=>{
                lauchData.ai[item.name] = temp;
                percentCall();
            }))
        })

        Promise.all(loadlist).then(()=>{
            this.startLoadingScene(lauchData, startData);
        }, ()=>{

        })
    }

    protected startLoadingScene( configs : LauchLogicConfig, startData : StartData)
    {
        let scenepath = `battle#scene/scene_${startData.scene}`;
        SceneMgr.getInstance().loadRunScene(scenepath, ( success, scene : cc.Scene)=>{
            (startData as any).config = configs
            scene.emit(BattleLauchEvent.LoadingBattleSceneDone, startData)
        }, ( percent : number)=>{
            this.dispatchEvent(BattleLauchEvent.LoadingBattleSceneProcess, percent);
        })  
    }
}