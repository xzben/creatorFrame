
import * as cc from 'cc';
import { log } from '../log/log';
import { EventDispatcher } from '../frame';
import { AdInterface } from './adsdk/AdInterface';
import { UpdateManager } from '../update/UpdateManager';
import { AnalyticsInterface } from './analytics/AnalyticsInterface';
import { utils } from '../utils/utils';
import { ChannelType, LoginWay, PlatformType } from '../../config/PlatformConfig';
import { Store } from '../utils/util/Store';

const { ccclass, property } = cc._decorator;
export type DoneFunc = (...parameters:any)=>void;

export enum WXShareScene {
    FRIEND_SESSION 	= 0, //--好友 聊天
	FRIEND_TIMELINE = 1, // --朋友圈
	FAVORITE    	= 2, // --收藏
	SPECIAL_CONTACT = 4, //-- 未知
}

@ccclass('PlatformBase')
export class PlatformBase extends EventDispatcher{
    protected m_hasUpdate : boolean = true;
    private m_adInterface : AdInterface = null!;
    private m_analyticsInterface : AnalyticsInterface = null!;

    public init(){
        this.getAdInterface()
        this.getASInterface()
    }

    public getPlatform() : PlatformType{
        return PlatformType.WIN32;
    }

    public getChannel(){
        return ChannelType.Official;
    }

    public isSupportGPUBake(){
        return true;
    }
    
    public getAppVersionName(){
        let version = UpdateManager.getInstance().getLocalVersion()
        return version;
    }

    public getSafeArea() {
        let safeArea = cc.sys.getSafeAreaRect();
        return safeArea;
    }

    //唯一码用于游客登录
    public getUniqueCode(doneCallback : DoneFunc){
        doneCallback("")    
    }

    public hasUpdate() {
        return this.m_hasUpdate;
    }   

    //设置检测更新回调 false:不需要更新
	public onCheckUpdate(doneCallback : DoneFunc){
        doneCallback(false)
    }

    //设置快速登录token
    public setQuickToken(code : string){
        if (code != null || code != undefined) {
            Store.getInstance().setStringItem("quicklyCode", code);
        }		
    }

    //获得快速登录token
    public getQuickToken(){
		return Store.getInstance().getStringItem("quicklyCode", "");
    }

    //设置游客登录token
    public setTouristToken(code : string){
        if (code != null || code != undefined) {
            Store.getInstance().setStringItem("touristCode", code);
        }		
    }

    //判断是否是游客登录
    public isTouristLogin(){
        let value = this.getTouristToken();
        return value != '';
    }

    //获得游客登录token
    public getTouristToken(){
        return Store.getInstance().getStringItem("touristCode", "");
    }

    //原生平台回调js代码
    public callJsEngine(json:string){
		var values : any = JSON.parse(json)
        if (values.funcName) {
            log.d('#########callJsEngine:', json)
            this.dispatch(values.funcName, values);
        }
    }

    //广告接口  设置类型后再初始化init
    public getAdInterface(){
        if (!this.m_adInterface) {
            let platform = this.getPlatform()
            let channel = this.getChannel()
            this.m_adInterface = new AdInterface(platform, channel, this)
            this.m_adInterface.init()
        }
        return this.m_adInterface
    }

    //统计分析接口
    public getASInterface(){
        if (!this.m_analyticsInterface) {
            let platform = this.getPlatform()
            let channel = this.getChannel()
            this.m_analyticsInterface = new AnalyticsInterface(platform, channel, this)
            this.m_analyticsInterface.init()
        }
        return this.m_analyticsInterface
    }

    public restart(){
        cc.game.restart();
    }

    public exitGame(){
       cc.game.end(); 
    }

    public openUrl( url : string){
        try{
            if(cc.sys.isNative){
                jsb.openURL(url);
            }else{
                cc.sys.openURL(url);
            }
        }catch( err : any ){
            console.error("open url error", url, err.message );
        }
    }

    public getSafeAreaRect() : cc.Rect{
        return cc.sys.getSafeAreaRect();
    }

    public getNetworkType() : number{
        return cc.sys.getNetworkType();
    }

    public getBatteryLevel() : number{
        return cc.sys.getBatteryLevel();
    }

    //宿主APP名称
    public getHostAppName(){
        return "base"
    }

    public createUserAuthBtn(node:cc.Node, btnCallback:DoneFunc){
    }

    //检测应用是否存在
    public checkAppExist(loginWay : LoginWay){
        return true;
    }

    //游戏登录
	public login(loginWay : LoginWay, doneCallback : DoneFunc){
        
	}

    //游客绑定账号
    public bindAccount(loginWay : LoginWay, doneCallback : DoneFunc){
       
    }

    //显示好友排行榜
    public showFriendRands(){
    }

    //更新自己的开放域数据
    //winCount：奖杯数量
	public updateSelfOpenData(winCount : number){
        log.d("======updateSelfOpenData=====winCount:", winCount)
	}

    //震动接口
    public vibrator( ms : number){
        console.log("vibrator ms", ms);
    }

    //title:转发标题
	//imageUrl:转发显示图片的链接，
    //data:其他参数数据
    public share(title : string, imageUrl : string, data ?: any){
        utils.AlertTips.show("模拟分享");
    }

    //设置小游戏菜单分享数据
    public setMenuShare(title : string, imageUrl : string, data ?: any){

    }

    //开始录屏
    public recorderStart(doneCallback : DoneFunc){
    }

    //结束录屏
    public recorderStop(){
    }

    //title:标题
	//videoPath:录屏得到的视频地址
	public shareVideo(title : string, videoPath : string, desc : string, videoTopics : string[], doneCallback : DoneFunc, data? : any){
    }

    //判断文件是否存在
	public isFileExist(fileName : string) {
        if(cc.sys.isNative){
            return jsb.fileUtils.isFileExist(fileName);
        }
        return false;
    }

    public addGameBBS(node : cc.Node){
        console.log("addGameBBS")
    }

	public removeGameBBS(){
        console.log("removeGameBBS")
	}

    public hideGameBBS(){
        console.log("hideGameBBS")
    }

    public showGameBBS(){
        console.log("showGameBBS")
    }
    
    public isIOS(): boolean {
        return false;
    }

    public getBenchmarkLevel(): number {
        return 50;
    }
    
    /**
     * 低端机判断
     */
    public checkIsLowPhone () {
        let checkBenchmark = 22; //判断低端机的性能等级

        return this.getBenchmarkLevel() < checkBenchmark
    }
}