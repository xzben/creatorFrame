/*
 * @Author: xzben
 * @Date: 2022-05-25 11:43:03
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-13 10:05:36
 * @Description: file content
 */

import * as cc from 'cc';
import { log } from '../../log/log';
import { platformWx } from './platformWx';
import { ChannelType, LoginWay } from '../../../config/PlatformConfig';
import { DoneFunc } from '../platformBase';
const { ccclass, property } = cc._decorator;

let tempWind : any = window;
let mini : any = tempWind.qq;

//QQ小游戏
@ccclass('platformQQ')
export class platformQQ extends platformWx{

	public initShareInfo(){
		mini.showShareMenu({
            showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment']
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
	}

	//获取渠道
    public getChannel(){
        return ChannelType.MiniQQ;
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
									loginWay : LoginWay.MINI_QQ,
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
	
	//震动接口
	public vibrator( ms : number){
		if( ms >= 400){
			//震动 400 ms
			mini.vibrateLong()
		}else{
			//震动 15 ms
            if (!this.filterIphoneModel()) {
			    mini.vibrateShort()
            }
		}
    }
}