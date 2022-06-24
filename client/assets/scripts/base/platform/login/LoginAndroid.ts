
import * as cc from "cc"
import { log } from "../../log/log";
import { EventDispatcher } from "../../frame";
import { LoginBase, ListenerFunc } from "./LoginBase";
import { AppPackageName, LoginWay } from "../../../config/PlatformConfig";
const {ccclass, property} = cc._decorator;


//配置安卓渠道登录方式的app包名及名称
let LoginWayPackageData : any = {
    [LoginWay.WEIXIN] : {package : AppPackageName.WEIXIN, appname : '微信'},
    [LoginWay.TAPTAP] : {package : AppPackageName.TAPTAP, appname : 'TapTap'},
    [LoginWay.MOMOYU] : {package : AppPackageName.MOMOYU, appname : '摸摸鱼'},
}

//登录方式映射的函数
let LoginWayFuncMap : any = {
    [LoginWay.WEIXIN] : "weChatLogin",
    [LoginWay.TAPTAP] : "taptapLogin",
    [LoginWay.MOMOYU] : "momoyuLogin",
    [LoginWay.GOOGLE_PLAY] : "googlePlayLogin",
}

@ccclass('LoginAndroid')
export class LoginAndroid extends LoginBase{
    protected m_delegate!: EventDispatcher;

    public init(){
        log.d("############# LoginAndroid:init()")
    }

    public setDelegate(delegate:EventDispatcher){
        this.m_delegate = delegate;
    }

    //检测应用是否存在
    public checkAppExist(loginWay : LoginWay){
        let packageData : any = LoginWayPackageData[loginWay];
        let packageName : string = packageData.package;
        let sigs = "(Ljava/lang/String;)I"
        let value = jsb.reflection.callStaticMethod('com/utils/OpenappUtil', 'checkAppExist',sigs, packageName); 
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

    //微信的SDK登录
    private weChatLogin(doneCallback : ListenerFunc){
        this.m_delegate.addListenerOnce("onWeChatLogin", this, (obj:any)=>{
            log.d("=====login:onWeChatLogin====", obj.code);
            doneCallback({
                openId : obj.code,
                loginWay : LoginWay.WEIXIN,
            }) 
        })
        let stringify = JSON.stringify({
            scope:"snsapi_userinfo",
            state:"123",
        })
        let sigs = "(Ljava/lang/String;)V"
        jsb.reflection.callStaticMethod('com/weChat/WeChatUtil', 'weChatLogin', sigs, stringify); 
    }

    //taptap的SDK登录
    private taptapLogin(doneCallback : ListenerFunc){
        this.m_delegate.addListenerOnce("onTaptapLogin", this, (obj:any)=>{
            log.d("=====login:onTaptapLogin====", obj.userID, obj.avatar, obj.nickname);
            doneCallback({
                openId : obj.userID,
                icon : obj.avatar,
                nickname : obj.nickname,
                loginWay : LoginWay.TAPTAP,
            }) 
        })
        let stringify = JSON.stringify({})
        let sigs = "(Ljava/lang/String;)V"
        jsb.reflection.callStaticMethod('channel/TapUtil', 'taptapLogin', sigs, stringify); 
    }

    //momoyu的SDK登录
    private momoyuLogin(doneCallback : ListenerFunc){
        this.m_delegate.addListenerOnce("onMomoyuLogin", this, (obj:any)=>{
            log.d("=====login:onMomoyuLogin====", obj.userID, obj.avatar, obj.nickname);
            doneCallback({
                openId : obj.userID,
                icon : obj.avatar,
                nickname : obj.nickname,
                loginWay : LoginWay.MOMOYU,
            }) 
        })
        let stringify = JSON.stringify({})
        let sigs = "(Ljava/lang/String;)V"
        jsb.reflection.callStaticMethod('channel/MomoyuUtil', 'momoyuLogin', sigs, stringify); 
    }

    //googlePlay的SDK登录
    private googlePlayLogin(doneCallback : ListenerFunc){
        this.m_delegate.addListenerOnce("onGooglePlayLogin", this, (obj:any)=>{
            log.d("=====login:onGooglePlayLogin====", obj.userID, obj.avatar, obj.nickname);
            doneCallback({
                openId : obj.userID,
                icon : obj.avatar,
                nickname : obj.displayName,
                loginWay : LoginWay.GOOGLE_PLAY,
            }) 
        })
        let stringify = JSON.stringify({})
        let sigs = "(Ljava/lang/String;)V"
        jsb.reflection.callStaticMethod('channel/GooglePlayUtil', 'googlePlayLogin', sigs, stringify); 
    }

}
