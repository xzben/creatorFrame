
import * as cc from "cc"
import { log } from "../../../log/log";
import { AnalyticsBase } from "../AnalyticsBase";
const {ccclass, property} = cc._decorator;

export type ListenerFunc = (...param : any)=>void;

let tempWind : any = window;

@ccclass('UMengH5')
export class UMengH5 extends AnalyticsBase{
    public init(){
        log.d("############# UMengH5:init()")
    }

    public enableDebug(enabled: boolean){
        tempWind.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['DEBUG', enabled]
        });
    }

    public loginSuccess( roleID : number,  userName : string){
        tempWind.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['_user_id', roleID + ''] 
        });
    }

    public virtualReward(reason : string, amount : number){
        this.customEvent('virtual_reward', {reason : reason+'', amount : amount + ''})
    }
    
    public virtualConsume(reason : string, count : number){
        this.customEvent('virtual_consume', {reason : reason+'', amount : count + ''})
    }

    public ItemConsume(item : string, itemNumber : number){
        this.customEvent('item_consume', {reason : '物品id-'+item, amount : itemNumber + ''})
    }

    public levelsBegin(level : string){
        this.customEvent('levels_begin', {level : 'ID-'+level})
    }

    public levelsCompleted(level : string){
        this.customEvent('levels_completed', {level : 'ID-'+level})
    }

    public levelsFailed(level : string, reason : string){
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
        log.d("==UMengH5:customEvent===", eventId, stringify);

        tempWind.aplus_queue.push({
            action: 'aplus.record',
            arguments: [eventId, 'CLK', datas]
        });
    }
 
}
