
import * as cc from "cc"
import { log } from "../../log/log";
import { EventDispatcher } from "../../frame";
import { LoginBase, ListenerFunc } from "./LoginBase";
import { LoginWay } from "../../../config/PlatformConfig";
const {ccclass, property} = cc._decorator;

//配置安卓渠道登录方式的app包名及名称
let LoginWayPackageData : any = {
    [LoginWay.IOS_APPLE] : {URLSchemes : "", appname : 'apple'},
    [LoginWay.WEIXIN] : {URLSchemes : "IOSDevApp://", appname : '微信'},
}

//登录方式映射的函数
let LoginWayFuncMap : any = {
    [LoginWay.IOS_APPLE] : "appleLogin",
    [LoginWay.WEIXIN] : "weChatLogin",
}

@ccclass('LoginIOS')
export class LoginIOS extends LoginBase{
    protected m_delegate!: EventDispatcher;

    public init(){
        log.d("############# LoginIOS:init()")
    }

    public setDelegate(delegate:EventDispatcher){
        this.m_delegate = delegate;
    }

    //检测应用是否存在
    public checkAppExist(loginWay : LoginWay){
        let packageData : any = LoginWayPackageData[loginWay];
        let URLSchemes : string = packageData.URLSchemes;
        let value = jsb.reflection.callStaticMethod('AppUtil', 'checkAppExist', URLSchemes); 
        log.d("===checkAppExist======:", value)
        return value == 1;
    }

    /*/渠道登录
    //doneCallback((data:any)=>{})
    //data:返回参数
    {
        openId : touristId,
        icon : data.icon,
        nickname : data.nickname,
        loginWay : data.loginWay,
    }
    */
    public login(loginWay : LoginWay, doneCallback : ListenerFunc){
        let target : any = this;
        let funcname : string = LoginWayFuncMap[loginWay];
        let updateFunc : Function = target[funcname];

        if(typeof(updateFunc) != "function"){
            log.e("can't find login func from target", loginWay);
            return;
        }
        return updateFunc.call(target, doneCallback);
    }

    /*游客绑定账号
    //doneCallback((data:any)=>{})
    //data:返回参数
    {
        openId : touristId,
        icon : data.icon,
        nickname : data.nickname,
        loginWay : data.loginWay,
    }
    */
    public bindAccount(loginWay : LoginWay, doneCallback : ListenerFunc){
        let target : any = this;
        let funcname : string = LoginWayFuncMap[loginWay];
        let updateFunc : Function = target[funcname];

        if(typeof(updateFunc) != "function"){
            log.e("can't find login func from target", loginWay);
            return;
        }
        return updateFunc.call(target, (data : any)=>{
            let touristId = JSON.stringify({
                ouuid : this.getTouristToken(),
                sdk : data.loginWay,
                nuuid : data.openId,
            })
            doneCallback({
                openId : touristId,
                icon : data.icon,
                nickname : data.nickname,
                loginWay : data.loginWay,
            })
        });
    }

    //apple的SDK登录
    private appleLogin(doneCallback : ListenerFunc){
        this.m_delegate.addListenerOnce("onAuthResp", this, (obj:any)=>{
            log.d("=====login:onAuthResp====", obj.code);
            if(doneCallback){
                doneCallback({
                    openId : obj.code,
                    loginWay : LoginWay.IOS_APPLE,
                })
            }  
        })

        let stringify = JSON.stringify({
            scope:"snsapi_userinfo",
            state:"123",
        })
        jsb.reflection.callStaticMethod('AppleUtil', 'sendAuth:', stringify); 
    }

     //微信的SDK登录
     private weChatLogin(doneCallback : ListenerFunc){
        this.m_delegate.addListenerOnce("onAuthResp", this, (obj:any)=>{
            log.d("=====login:onAuthResp====", obj.code);
            if(doneCallback){
                doneCallback({
                    openId : obj.code,
                    loginWay : LoginWay.WEIXIN,
                })
            }  
        })

        let stringify = JSON.stringify({
            scope:"snsapi_userinfo",
            state:"123",
        })
        jsb.reflection.callStaticMethod('WeChatUtil', 'sendAuth:', stringify); 
    }

}
