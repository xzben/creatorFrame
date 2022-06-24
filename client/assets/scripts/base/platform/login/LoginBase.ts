/*
 * @Author: xzben
 * @Date: 2022-05-25 11:43:04
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 12:33:10
 * @Description: file content
 */

import * as cc from "cc"
import { log } from "../../log/log";
import { EventDispatcher } from "../../frame";
import { Store } from "../../utils/util/Store";
import { LoginWay } from "../../../config/PlatformConfig";
const {ccclass, property} = cc._decorator;


export type ListenerFunc = (...param : any)=>void;

@ccclass('LoginBase')
export class LoginBase {
    protected m_delegate!: EventDispatcher;

    public init(){
        log.d("############# LoginBase:init()")
    }

    public setDelegate(delegate:EventDispatcher){
        this.m_delegate = delegate;
    }

    //获得游客登录token
    public getTouristToken(){
        return Store.getInstance().getStringItem("touristCode", "");
    }

    //检测应用是否存在
    public checkAppExist(loginWay : LoginWay){
        return true;
    }

    //渠道登录
    public login(loginWay : LoginWay, doneCallback : ListenerFunc){
 
    }

    //游客绑定账号
    public bindAccount(loginWay : LoginWay, doneCallback : ListenerFunc){
    
    }

}
