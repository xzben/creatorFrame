
import * as cc from "cc"
import { log } from "../../log/log";
import { EventDispatcher } from "../../frame";
const {ccclass, property} = cc._decorator;

export type ListenerFunc = (...param : any)=>void;

export enum ProfileType {
    ANONYMOUS = 0,  //匿名
    REGISTERED,   //自有帐户显性注册
    SINA_WEIBO,    //新浪微博
    QQ,             //QQ
    QQ_WEIBO,       //腾讯微博
    ND91,           //网龙91
    WEIXIN,         //微信
    TYPE1,
}

@ccclass('AnalyticsBase')
export class AnalyticsBase {
    protected m_delegate!: EventDispatcher;

    public init(){
        log.d("############# AnalyticsBase:init()")
        cc.game.on(cc.Game.EVENT_HIDE, ()=>{
                 
        });
    }

    public setDelegate(delegate:EventDispatcher){
        this.m_delegate = delegate;
    }
    
    public enableDebug(enabled: boolean){
        
    }

    public loginSuccess( roleID : number,  userName : string){
        let stringify = JSON.stringify({
            roleID : roleID + '',
            userName : userName,
        })
        log.d("==AnalyticsBase:loginSuccess===", stringify)
    }

    public virtualReward(reason : string, amount : number){
        let stringify = JSON.stringify({
            amount : amount,  //虚拟币金额
            reason : reason,  //赠送虚拟币原因/类型
        })
        log.d("==AnalyticsBase:virtualReward===", stringify)
    }
    
    public virtualConsume(reason : string, count : number){
        let stringify = JSON.stringify({
            amount : count,  //虚拟币金额
            item : reason,  //赠送虚拟币原因/类型
        })
        log.d("==AnalyticsBase:virtualConsume===", stringify)
    }

    public ItemConsume(item : string, itemNumber : number){
        let stringify = JSON.stringify({
            item : item,  //消耗的物品
            itemNumber : itemNumber,  //数量
        })
        log.d("==AnalyticsBase:ItemConsume===", stringify)
    }

    public levelsBegin(level : string){
        let stringify = JSON.stringify({
            level : level,  //关卡描述
        })
        log.d("==AnalyticsBase:levelsBegin===", stringify)
    }


    public levelsCompleted(level : string){
        let stringify = JSON.stringify({
            level : level,  //关卡描述
        })
        log.d("==AnalyticsBase:levelsCompleted===", stringify)
    }

    public levelsFailed(level : string, reason : string){
        let stringify = JSON.stringify({
            level : level,  //关卡描述
            reason : reason,
        })
        log.d("==AnalyticsBase:levelsFailed===", stringify)
    }

    public customEvent(eventId : string, eventData : any){
        let datas : any = { eventId : eventId }
        if (eventData) {
            for (let key in eventData) {
                datas[key] = eventData[key] + "";
            }
        }
        let stringify = JSON.stringify(datas)
        log.d("==AnalyticsBase:customEvent===", stringify)
    }
}
