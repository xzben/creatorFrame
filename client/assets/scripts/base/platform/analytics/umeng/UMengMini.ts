
import * as cc from "cc"
import { log } from "../../../log/log";
import { AnalyticsBase } from "../AnalyticsBase";
const {ccclass, property} = cc._decorator;

export type ListenerFunc = (...param : any)=>void;

let tempWind : any = window;
let mini : any = tempWind.wx || tempWind.qq || tempWind.tt || tempWind.swan || tempWind.qg;

@ccclass('UMengMini')
export class UMengMini extends AnalyticsBase{
    //@ts-ignore
    private umSys : any = mini.uma;

    public init(){
        log.d("############# UMengMini:init()")
    }

    public enableDebug(enabled: boolean){
        
    }

    public loginSuccess( roleID : number,  userName : string){
        this.umSys.setUserid(roleID + '');
    }

    public virtualReward(reason : string, amount : number){
        this.umSys.stage.onRunning({
            stageId : "钻石",
            stageName : "获得方式" + reason,
            event : "award",
            params : {
                count : amount,
            }
        })
        this.customEvent('virtual_reward', {reason : reason+'', amount : amount + ''})
    }
    
    public virtualConsume(reason : string, count : number){
        this.umSys.stage.onRunning({
            stageId : "钻石",
            stageName : "消耗方式" + reason,
            event : "tools",
            params : {
                count : count,
            }
        })
        this.customEvent('virtual_consume', {reason : reason+'', amount : count + ''})
    }

    public ItemConsume(item : string, itemNumber : number){
        this.umSys.stage.onRunning({
            stageId : "物品id-",
            stageName : item,
            event : "tools",
            params : {
                itemNum : itemNumber,
            }
        })
        this.customEvent('item_consume', {reason : '物品id-'+item, amount : itemNumber + ''})
    }

    public levelsBegin(level : string){
        this.umSys.stage.onStart({stageId : level, stageName : level});
        this.customEvent('levels_begin', {level : 'ID-'+level})
    }


    public levelsCompleted(level : string){
        this.umSys.stage.onEnd({stageId : level, stageName : level, event : "complete"});
        this.customEvent('levels_completed', {level : 'ID-'+level})
    }

    public levelsFailed(level : string, reason : string){
        this.umSys.stage.onEnd({stageId : level, stageName : level, event : "fail"});
        this.customEvent('levels_failed', {level : 'ID-'+level, reason : reason})
    }

    public customEvent(eventId : string, eventData : any){
        let datas : any = { }
        if (eventData) {
            for (let key in eventData) {
                datas[key] = eventData[key] + "";
            }
        }
        let stringify = JSON.stringify(datas);
        log.d("==UMengMini:customEvent===", eventId, stringify);
        this.umSys.trackEvent(eventId, datas);
    }
 
}
