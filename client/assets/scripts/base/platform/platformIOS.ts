/*
 * @Author: xzben
 * @Date: 2022-05-25 11:43:04
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-13 09:59:32
 * @Description: file content
 */

import * as cc from 'cc';
import { utils } from '../utils/utils';
import { LoginIOS } from './login/LoginIOS';
import { PlatformBase, DoneFunc } from './platformBase';
import { ChannelType, LoginWay, PlatformType } from '../../config/PlatformConfig';

const { ccclass, property } = cc._decorator;


@ccclass('PlatformIOS')
export class PlatformIOS extends PlatformBase{
    private m_loginImp : LoginIOS = null!;

    constructor(){
        super();
        this.m_loginImp = new LoginIOS();
    }

    public init(){
        super.init();
        this.m_loginImp.setDelegate(this);
    }
    
    public isIOS(): boolean {
        return true;
    }

    //获得平台信息
    public getPlatform() : PlatformType{
        return PlatformType.IOS;
    }

    //IOS渠道
    public getChannel(){
        return ChannelType.Apple;
    }

    //唯一码用于游客登录
    public getUniqueCode(doneCallback : DoneFunc){
        let stringify = JSON.stringify({})
        let code = jsb.reflection.callStaticMethod('AppUtil', 'getUniqueCode:', stringify); 
        let uniqueCode = code +  +'#'+ utils.timeus();
        doneCallback(uniqueCode)
    }

    //检测应用是否存在
    public checkAppExist(loginWay : LoginWay){
        return this.m_loginImp.checkAppExist(loginWay);
    }

    //游戏登录
	public login(loginWay : LoginWay, doneCallback : DoneFunc){
        return this.m_loginImp.login(loginWay, doneCallback);
	}

    //游客绑定账号
    public bindAccount(loginWay : LoginWay, doneCallback : DoneFunc){
        return this.m_loginImp.bindAccount(loginWay, doneCallback);
    }
    
}