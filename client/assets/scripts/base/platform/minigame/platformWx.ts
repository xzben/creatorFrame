
import * as cc from 'cc';
import { log } from '../../log/log';
import { platformH5 } from '../platformH5';
import { DoneFunc } from '../platformBase';
import { AutoView } from '../../utils/view/AutoView';
import { ChannelType, LoginWay } from '../../../config/PlatformConfig';
const { ccclass, property } = cc._decorator;

let tempWind : any = window;
let mini : any = tempWind.wx;

//微信小游戏
@ccclass('platformWx')
export class platformWx extends platformH5{
	protected m_btnBBS : any = null!;

	public initShareInfo(){
		mini.showShareMenu({
			withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
		});
		//监听右上角的分享好友调用 
		mini.onShareAppMessage((res:any)=>{
			console.log("==onShareAppMessage==", this.m_menuShareData.imageUrl)
			return {
				title : this.m_menuShareData.title,
				imageUrl : this.m_menuShareData.imageUrl,
				query : this.m_menuShareData.query,
			}
		})
		//监听右上角的分享朋友圈调用 
		mini.onShareTimeline((res:any)=>{
			console.log("==onShareTimeline==", this.m_menuShareData.imageUrl)
			return {
				title : this.m_menuShareData.title,
				imageUrl : this.m_menuShareData.imageUrl,
				imagePreviewUrl : this.m_menuShareData.imageUrl,
				query : this.m_menuShareData.query,
			}
		})
	}
	
	public init(){
		super.init();
		this.initShareInfo();
	}

	//获取渠道
    public getChannel(){
        return ChannelType.MiniWX;
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
			return sys.benchmarkLevel;
		}
    }

	private getNodeRect( node : cc.Node) : cc.Rect{
		let sysInfo = mini.getSystemInfoSync();
		let winSize = cc.view.getVisibleSize();
		let uitranform = node.getComponent(cc.UITransform);
		let scalex = sysInfo.screenWidth/winSize.width;
		let scaley = sysInfo.screenHeight/winSize.height;
		let scale = scalex > scaley ? scaley : scalex;
		let w = (-uitranform!.anchorX)*uitranform!.width;
		let h = (-uitranform!.anchorY)*uitranform!.height;
		let pos = uitranform!.convertToWorldSpaceAR(cc.v3(w,h,0));
		let xx = scalex*(pos.x)
		let yy = sysInfo.screenHeight - scaley*(pos.y + uitranform!.height)
		log.d("getNodeRect", sysInfo, cc.view.getCanvasSize(), cc.view.getVisibleSize(), cc.view.getVisibleSizeInPixel(),cc.view.getResolutionPolicy())
		let width = scale*(uitranform!.width)
		let height = scale*(uitranform!.height)

		return cc.rect(xx, yy, width, height);
	}

	//用户授权按钮
	public createUserAuthBtn(node:cc.Node, btnCallback:DoneFunc){
		let sysInfo = mini.getSystemInfoSync();
		let winSize = cc.view.getVisibleSize();
		let uitranform = node.getComponent(cc.UITransform);
		let scalex = sysInfo.screenWidth/winSize.width;
		let scaley = sysInfo.screenHeight/winSize.height;
		let scale = scalex > scaley ? scaley : scalex;
		let w = (-uitranform!.anchorX)*uitranform!.width;
		let h = (-uitranform!.anchorY)*uitranform!.height;
		let pos = uitranform!.convertToWorldSpaceAR(cc.v3(w,h,0));
		let xx = scalex*(pos.x)
		let yy = sysInfo.screenHeight - scaley*(pos.y + uitranform!.height)
		log.d("======createUserInfoButton111=======", sysInfo, cc.view.getCanvasSize(), cc.view.getVisibleSize(), cc.view.getVisibleSizeInPixel(),cc.view.getResolutionPolicy())
		let width = scale*(uitranform!.width)
		let height = scale*(uitranform!.height)
		let button = mini.createUserInfoButton({
										type: "text",
						                text: "",
				                        style: {
				                            left: xx,
				                            top: yy,
				                            width: width,
				                            height: height,
											lineHeight:40,
											backgroundColor:'#ff000000',
											color:'#ffffff',
											borderRadius: 4,
				                        }
		})

		button.onTap((res1:any) => {
			log.d("==button.onTap===")
			this.checkAuth(btnCallback, "scope.userInfo")
		})

		let autoView = node.addComponent(AutoView)
		autoView.setCloseCallback(()=>{
			log.d("===createUserInfoButton==destroy")
			button.destroy()
		})
	}

	//游戏登录
	public login(loginWay : LoginWay, doneCallback : DoneFunc){
		let self = this;
		this.checkAuth((success)=>{
			if(success){
				mini.login({
					success : function(obj:any){
						log.d("############ login success", obj.code)
						mini.getUserInfo({
							success(infoData:any){
								log.d("############ infoData", infoData)
                       			doneCallback({
									openId : obj.code,
									icon : infoData.userInfo.avatarUrl,
									nickname : infoData.userInfo.nickName,
									loginWay : LoginWay.MINI_WEIXIN,
								})
							}
						})
					}
				})
			}else{
				log.d("==用户没有授权===")
			}
		}, 'scope.userInfo')
	}

	//震动接口
	public vibrator( ms : number){
		if( ms >= 400){
			//震动 400 ms
			mini.vibrateLong()
		}else{
			if (!this.filterIphoneModel()) {
				//震动 15 ms
				let type = "medium";
				if(ms <= 15){
					type = "light";
				}else if(ms > 15 && ms <= 100){
					type = "medium";
				}else{
					type = "heavy"
				}
				mini.vibrateShort({
					type : type,
					style : type,
				 	fail(){},
				})
			}
		}
    }

	public addGameBBS(node : cc.Node){
		if(this.m_btnBBS != null){
			this.m_btnBBS.destroy();
			this.m_btnBBS = null;
		}
		let sp = node.getComponent(cc.Sprite);
		if(sp){
			sp.destroy();
		}
		
		cc.director.getScheduler().schedule(()=>{
			let rect = this.getNodeRect(node);
			let button = mini.createGameClubButton({
				icon: 'green',
				style: {
				left: rect.x,
				top: rect.y,
				width: rect.width,
				height: rect.height,
				}
			})
			this.m_btnBBS = button;
		}, node, 0, 0, 1, false);		
    }

	public removeGameBBS(){
		if(this.m_btnBBS){
			this.m_btnBBS.destroy();
			this.m_btnBBS = null;
		}
	}

    public hideGameBBS(){
		if(this.m_btnBBS){
			this.m_btnBBS.hide();
		}
    }

    public showGameBBS(){
		if(this.m_btnBBS){
			this.m_btnBBS.show();
		}
    }

}