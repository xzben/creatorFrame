
import * as cc from 'cc';
import { log } from '../log/log';
import { utils } from '../utils/utils';
import { LoginAndroid } from './login/LoginAndroid';
import { HttpUtils } from '../utils/util/HttpUtils';
import { FileUtils } from '../utils/util/FileUtils';
import { PlatformBase, DoneFunc, WXShareScene } from './platformBase';
import { AppPackageName, LoginWay, PlatformType } from '../../config/PlatformConfig';

const { ccclass, property } = cc._decorator;


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

@ccclass('PlatformAndroid')
export class PlatformAndroid extends PlatformBase{
    private m_loginImp : LoginAndroid = null!;

    constructor(){
        super();
        this.m_loginImp = new LoginAndroid();
    }

    public init(){
        super.init();
        this.m_loginImp.setDelegate(this);
    }

    //获得平台信息
    public getPlatform() : PlatformType{
        return PlatformType.Android;
    }

    //获取渠道
    public getChannel(){
        let sigs = "()Ljava/lang/String;"
        let channel = jsb.reflection.callStaticMethod('com/utils/AppUtil', 'getChannel', sigs); 
        log.d("===getChannel======:", channel)
        return channel;
    }

    //获得版本名称
    public getAppVersionName(){
        let sigs = "()Ljava/lang/String;"
        let version = jsb.reflection.callStaticMethod('com/utils/AppUtil', 'getAppVersionName', sigs); 
        log.d("===getAppVersionName======:", version)
        return version;
    }

    //震动接口
    public vibrator( ms : number){
        let sigs = "(Ljava/lang/String;)V"
        let stringify = JSON.stringify({
            type : 1,
            ms : ms,
        })
        jsb.reflection.callStaticMethod('com/utils/AppUtil', 'Vibrator', sigs, stringify);
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

    //微信分享文本
    private wxShareText( text : string, sceneType : WXShareScene)
    {
        let sigs = "(Ljava/lang/String;I)Z"
        jsb.reflection.callStaticMethod('com/weChat/WeChatUtil', 'shareText', sigs, text, sceneType); 
    }

    //微信分享图片
    private wxShareImage( imageFile : string, sceneType : WXShareScene){
        let smallWidth = 150
	    let smallHeight = 150
	    let qulity = 100
        let sigs = "(Ljava/lang/String;IIII)Z"

        jsb.reflection.callStaticMethod('com/weChat/WeChatUtil', 'shareImage', sigs, imageFile, smallWidth, smallHeight, qulity, sceneType); 
    }

    private wxShareWebpage( url : string, title : string, desc : string, sceneType : WXShareScene){
	    let qulity = 100

        let sigs = "(Ljava/lang/String;ILjava/lang/String;Ljava/lang/String;I)Z"
        jsb.reflection.callStaticMethod('com/weChat/WeChatUtil', 'shareWebpage', sigs, url, qulity, title, desc, sceneType); 
    }

    //微信分享小游戏
    private wxShareMiniProgram( url : string, userName : string, path : string, title : string, desc : string, progrmType ?: number){
        progrmType = progrmType == null ? 0 : progrmType;  //-- 正式 0, 测试 1， 体验 2
        let qulity = 100
        
        let sceneType = WXShareScene.FRIEND_SESSION;
        let sigs = "(Ljava/lang/String;ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;II)Z"
        jsb.reflection.callStaticMethod('com/weChat/WeChatUtil', 'shareMiniProgram', sigs, url, progrmType, userName, path, title, desc, qulity, sceneType); 
    }

    //原生平台下载远程图片到本地
    private downloadRemoteFile2Local(remoteImgUrl : string, doneCallback : DoneFunc){
        if (!utils.isUrl(remoteImgUrl)) return;

        let v = remoteImgUrl.split('/');
        let dirpath = jsb.fileUtils.getWritablePath() + '/remoteFiles/';
        let filepath = dirpath + v[v.length-1];
        if (!jsb.fileUtils.isFileExist(dirpath)) {// 目录不存在，创建
            jsb.fileUtils.createDirectory(dirpath);
        }
        HttpUtils.downloadRemoteFile(remoteImgUrl, (data : any)=>{
            if (data) {
                if(FileUtils.saveDataForNative(new Uint8Array(data), filepath)){
                    doneCallback(true, filepath);
                }else{
                    doneCallback(false, filepath);
                }
            }else{
                doneCallback(false, filepath);
            }
        })
    }

    //分享远程图片
    public share(title : string, remoteImgUrl : string, data ?: any){
        this.downloadRemoteFile2Local(remoteImgUrl, (success, filepath)=>{
            if (success) {
                this.wxShareImage(filepath, WXShareScene.FRIEND_SESSION)
            }
        })
    }

    //复制
    private copyToClipboard(text : string){
        let sigs = "(Ljava/lang/String;)V"
        jsb.reflection.callStaticMethod('com/utils/AppUtil', 'copyToClipboard', sigs, text);
    }
}