
import * as cc from "cc"
import { log } from "../../../log/log";
import { AnalyticsBase, ProfileType } from "../AnalyticsBase";
const {ccclass, property} = cc._decorator;

export type ListenerFunc = (...param : any)=>void;

@ccclass('TalkAndroid')
export class TalkAndroid  extends AnalyticsBase{

    public init(){
        log.d("############# TalkAndroid:init()")
    }

    
    public enableDebug(enabled: boolean){
        
    }

    public loginSuccess( roleID : number,  userName : string){
        let sigs = "(Ljava/lang/String;)V"
        let stringify = JSON.stringify({
            roleID : roleID + '',
            userName : userName,
            profileType : ProfileType.ANONYMOUS,
        })
        jsb.reflection.callStaticMethod("com/analytics/AnalyticsUtil", 'loginSuccess', sigs, stringify); 
    }

    public virtualReward(reason : string, amount : number){
        let sigs = "(Ljava/lang/String;)V"
        let stringify = JSON.stringify({
            amount : amount,  //虚拟币金额
            reason : reason,  //赠送虚拟币原因/类型
        })
        jsb.reflection.callStaticMethod("com/analytics/AnalyticsUtil", 'virtualReward', sigs, stringify);
        this.customEvent('virtual_reward', {reason : reason+'', amount : amount + ''})
    }
    
    public virtualConsume(reason : string, count : number){
        let sigs = "(Ljava/lang/String;)V"
        let stringify = JSON.stringify({
            amount : count,  //虚拟币金额
            item : reason,  //赠送虚拟币原因/类型
        })
        jsb.reflection.callStaticMethod("com/analytics/AnalyticsUtil", 'virtualConsume', sigs, stringify); 
        this.customEvent('virtual_consume', {reason : reason+'', amount : count + ''})
    }

    public ItemConsume(item : string, itemNumber : number){
        let sigs = "(Ljava/lang/String;)V"
        let stringify = JSON.stringify({
            item : item,  //消耗的物品
            itemNumber : itemNumber,  //数量
        })
        jsb.reflection.callStaticMethod("com/analytics/AnalyticsUtil", 'itemConsume', sigs, stringify); 
        this.customEvent('item_consume', {reason : '物品id-'+item, amount : itemNumber + ''})
    }

    public levelsBegin(level : string){
        let sigs = "(Ljava/lang/String;)V"
        let stringify = JSON.stringify({
            level : level,  //关卡描述
        })
        jsb.reflection.callStaticMethod("com/analytics/AnalyticsUtil", 'levelsBegin', sigs, stringify); 
        this.customEvent('levels_begin', {level : 'ID-'+level})
    }


    public levelsCompleted(level : string){
        let sigs = "(Ljava/lang/String;)V"
        let stringify = JSON.stringify({
            level : level,  //关卡描述
        })
        jsb.reflection.callStaticMethod("com/analytics/AnalyticsUtil", 'levelsCompleted', sigs, stringify); 
        this.customEvent('levels_completed', {level : 'ID-'+level})
    }

    public levelsFailed(level : string, reason : string){
        let sigs = "(Ljava/lang/String;)V"
        let stringify = JSON.stringify({
            level : level,  //关卡描述
            reason : reason,
        })
        jsb.reflection.callStaticMethod("com/analytics/AnalyticsUtil", 'levelsFailed', sigs, stringify); 
        this.customEvent('levels_failed', {level : 'ID-'+level, reason : reason})
    }

    public customEvent(eventId : string, eventData : any){
        let sigs = "(Ljava/lang/String;)V"
        let datas : any = { eventId : eventId }
        if (eventData) {
            for (let key in eventData) {
                datas[key] = eventData[key] + "";
            }
        }
        let stringify = JSON.stringify(datas)
        jsb.reflection.callStaticMethod("com/analytics/AnalyticsUtil", 'customEvent', sigs, stringify); 
    }
 
}
