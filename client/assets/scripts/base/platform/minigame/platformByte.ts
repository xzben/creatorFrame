
import * as cc from 'cc';
import { log } from '../../log/log';
import { utils } from '../../utils/utils';
import { DoneFunc } from '../platformBase';
import { StoreMgr } from '../../core/StoreMgr';
import { platformH5 } from '../platformH5';
import { ChannelType, LoginWay } from '../../../config/PlatformConfig';
const { ccclass, property } = cc._decorator;

let tempWind : any = window;
let mini : any = tempWind.tt;

//字节跳动
@ccclass('platformByte')
export class platformByte extends platformH5{
	constructor(){
		super();
		this.m_hasUpdate = false;
	}

	public init(){
		super.init();
		mini.showShareMenu();
		//监听右上角的分享好友调用 
		mini.onShareAppMessage((res:any)=>{
			console.log("==onShareAppMessage==", this.m_menuShareData.imageUrl)
			return {
				title : this.m_menuShareData.title,
				imageUrl : this.m_menuShareData.imageUrl,
				query : this.m_menuShareData.query,
			}
		})
	}

	public getBenchmarkLevel(): number {
		//@ts-ignore
		const sys = mini.getSystemInfoSync();
		const isIOS = sys.system.indexOf('iOS') >= 0;
		if (isIOS) {
			const model = sys.model;
			// iPhone 5s 及以下
			const ultraLowPhoneType = ['iPhone1,1', 'iPhone1,2', 'iPhone2,1', 'iPhone3,1', 'iPhone3,3', 'iPhone4,1', 'iPhone5,1', 'iPhone5,2', 'iPhone5,3', 'iPhone5,4', 'iPhone6,1', 'iPhone6,2'];
			// iPhone 6 ~ iPhone SE
			const lowPhoneType = ['iPhone6,2', 'iPhone7,1', 'iPhone7,2', 'iPhone8,1', 'iPhone8,2', 'iPhone8,4'];
			// iPhone 7 ~ iPhone X
			const middlePhoneType = ['iPhone9,1', 'iPhone9,2', 'iPhone9,3', 'iPhone9,4', 'iPhone10,1', 'iPhone10,2', 'iPhone10,3', 'iPhone10,4', 'iPhone10,5', 'iPhone10,6'];
			// iPhone XS 及以上
			const highPhoneType = ['iPhone11,2', 'iPhone11,4', 'iPhone11,6', 'iPhone11,8', 'iPhone12,1', 'iPhone12,3', 'iPhone12,5', 'iPhone12,8'];
			for (let i = 0; i < ultraLowPhoneType.length; i++) {
				if (model.indexOf(ultraLowPhoneType[i]) >= 0)
					return 5;
			}
			for (let i = 0; i < lowPhoneType.length; i++) {
				if (model.indexOf(lowPhoneType[i]) >= 0)
					return 10;
			}
			for (let i = 0; i < middlePhoneType.length; i++) {
				if (model.indexOf(middlePhoneType[i]) >= 0)
					return 20;
			}
			for (let i = 0; i < highPhoneType.length; i++) {
				if (model.indexOf(highPhoneType[i]) >= 0)
					return 30;
			}
			return -1;
		} else {
			return 50;
		}
    }

	//获取渠道
    public getChannel(){
        return ChannelType.MiniByte;
    }

	//宿主APP名称
    public getHostAppName(){
		let resSys = mini.getSystemInfoSync();
        return resSys.appName;
    }

	//唯一码用于游客登录
	public getUniqueCode(doneCallback : DoneFunc){
		let resSys = mini.getSystemInfoSync();
		let token = resSys.system +'#'+ resSys.platform +'#'+ resSys.brand +'#'+ resSys.model 
					+'#'+ resSys.version +'#'+ resSys.appName +'#'+ resSys.SDKVersion +'#'+ utils.timeus();
		doneCallback({
			uniqueCode : token,
		})
    }

	//游戏登录
	public login(loginWay : LoginWay, doneCallback : DoneFunc){
		let loginFunc = ()=>{
			mini.login({
				force: true,
				success(obj:any){
					log.d("############ login success", obj.code)
					mini.getUserInfo({
						success(infoData:any){
							log.d("############ infoData", infoData)
							doneCallback({
								openId : obj.code,
								icon : infoData.userInfo.avatarUrl,
								nickname : infoData.userInfo.nickName,
								loginWay : LoginWay.MINI_BYTE,
							})
						}
					})
				},
				fail(res:any) {
					console.log(`login 调用失败`, res);
					let resSys = mini.getSystemInfoSync();
					let token = resSys.system +'#'+ resSys.platform +'#'+ resSys.brand +'#'+ resSys.model 
								+'#'+ resSys.version +'#'+ resSys.appName +'#'+ resSys.SDKVersion +'#'+ utils.timeus();
					console.log(`login tourist:`, token);
					doneCallback({
						openId : token,
						loginWay : LoginWay.TOURIST,
					})
				},
				complete(res:any){
					console.log(`login 调用完成`);
				},
			})
		}
		
		let isFirst = StoreMgr.getInstance().getBoolValue("BYTE_FIRST_LOGIN", true)
		if (isFirst) {
			StoreMgr.getInstance().setBoolValue("BYTE_FIRST_LOGIN", false)
			loginFunc();
		}else{
			this.checkAuth((success)=>{
				if(success){
					loginFunc();
				}else{
					//字节默认使用游客登录
					let resSys = mini.getSystemInfoSync();
					let token = resSys.system +'#'+ resSys.platform +'#'+ resSys.brand +'#'+ resSys.model 
								+'#'+ resSys.version +'#'+ resSys.appName +'#'+ resSys.SDKVersion +'#'+ utils.timeus();
					console.log(`login tourist:`, token);
					doneCallback({
						openId : token,
						loginWay : LoginWay.TOURIST,
					})
				}
			}, 'scope.userInfo')
		}
	
	}

	//游客绑定字节账号
	public bindAccount(loginWay : LoginWay, doneCallback : DoneFunc){
		let self = this;
		let bindFunc = ()=>{
			mini.login({
				force: true,
				success(obj:any){
					log.d("############ byte bindAccount success", obj.code)
					mini.getUserInfo({
						success(infoData:any){
							log.d("############ infoData", infoData)
							let touristId = JSON.stringify({
								ouuid : self.getTouristToken(),
								sdk : LoginWay.MINI_BYTE,
								nuuid : obj.code,
							})
							doneCallback({
								openId : touristId,
								icon : infoData.userInfo.avatarUrl,
								nickname : infoData.userInfo.nickName,
								loginWay : LoginWay.MINI_BYTE,
							})
						}
					})
				},
				fail(res:any) {
					console.log(`login 调用失败`, res);
				},
				complete(res:any){
					console.log(`login 调用完成`);
				},
			})
		}

		this.checkAuth((success)=>{
			if(success){
				bindFunc();
			}else{
				utils.MsgBox.showConfirm("修改头像和昵称信息需要您在“设置”中开启“用户信息”权限", ()=>{
					this.openSetting((succ, authSetting)=>{
						if (succ && authSetting['scope.userInfo']) {
							bindFunc();
						}
					});	
				})
			}
		}, 'scope.userInfo')
	}

	//开始录屏
	public recorderStart(doneCallback : DoneFunc){
		console.log("录屏开始");
		let res = mini.getSystemInfoSync();
		const screenWidth = res.screenWidth;
		const screenHeight = res.screenHeight;
		const recorder = mini.getGameRecorderManager();
		var maskInfo = recorder.getMark();
		var x = (screenWidth - maskInfo.markWidth) / 2;
		var y = 1.8*maskInfo.markHeight;
		recorder.onStart((res:any) => {
			console.log("录屏开始回调");
		});
		recorder.onError((res:any) => {
			console.log("录屏失败回调", res.errMsg);
		});
		recorder.onStop((res:any) => {
			console.log("11录屏结束 回调", res.videoPath);
			doneCallback(res.videoPath)
		});

		//添加水印并且居中处理
		recorder.start({
			duration: 30,
			isMarkOpen: true,
			locLeft: x,
			locTop: y,
		});
	}

	//结束录屏
	public recorderStop(){
		console.log("录屏结束");
		const recorder = mini.getGameRecorderManager();
		recorder.stop();
	}

	//title:标题
	//videoPath:录屏得到的视频地址
	public shareVideo(title : string, videoPath : string, desc : string, videoTopics : string[], doneCallback : DoneFunc, data? : any){
		let query = "";
		let isFirst = true;
		data = data ? data : {};
		for(let key in data){
			if(!isFirst)
				query += "&"
			isFirst = false
			query +=  key + '=' + data[key]
		}

		mini.shareAppMessage({
			channel: "video",
			title: title,
			desc: desc,
			query: query,
			extra: {
			  videoPath: videoPath, // 替换成录屏得到的视频地址
			  videoTopics: videoTopics,
			  withVideoId: true,
			},
			success(res:any) {
			  console.log(res.videoId);
			  console.log(JSON.stringify(res.shareWithShareBgmStatus)); //回调参数
			  doneCallback(true, res);
			  console.log("分享视频成功");
			},
			fail(e:any) {
			  console.log("分享视频失败");
			  doneCallback(false, e);
			},
		});
	}


}