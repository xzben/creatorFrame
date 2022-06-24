
import * as cc from 'cc';
import { log } from '../../log/log';
import { DoneFunc } from '../platformBase';
import { PlatformWeb } from '../platformWeb';
import { ChannelType, LoginWay, PlatformType } from '../../../config/PlatformConfig';
const { ccclass, property } = cc._decorator;

let tempWind : any = window;
let quick : any = tempWind.mz;
let qg : any = tempWind.qg;

//魅族快游戏
@ccclass('platformMZ')
export class platformMZ extends PlatformWeb{
	constructor(){
		super();
		this.m_hasUpdate = false;
	}
	
	//获取渠道
    public getChannel(){
        return ChannelType.QuickMEIZU;
    }

    public getPlatform() : PlatformType{
        return PlatformType.QUICK;
    }

	//唯一码用于游客登录
	public getUniqueCode(doneCallback : DoneFunc){
		quick.getIMEI({
			success: (res:any) =>{
				console.log("getIMEI res = " +  res.imei);   
				doneCallback({
					uniqueCode : res.imei,
				})       
			},            
			fail: () =>{                
				console.log("getIMEI fail");           
			}
		});
    }

	//获得安全区域
	public getSafeArea() {
		let sysInfo = qg.getSystemInfoSync();
		console.log("===getSafeArea====sysInfo:", sysInfo)
        let winSize = cc.view.getVisibleSize();
        let rect = cc.rect(0, 0, winSize.width, winSize.height);
        if (sysInfo.safeArea) {
            if (winSize.width > winSize.height) {
				let scale = winSize.width/sysInfo.screenWidth;
				if (sysInfo.safeArea.left) {
					rect.x = sysInfo.safeArea.left*scale
					rect.width = winSize.width - 2*sysInfo.safeArea.left*scale
				}else if(sysInfo.safeArea.top){
					rect.x = sysInfo.safeArea.top*scale
					rect.width = winSize.width - 2*sysInfo.safeArea.top*scale
				}
            }
        }
        console.log("===getSafeArea====rect:", rect, winSize);
        return rect;
    }

	//游戏登录
	public login(loginWay : LoginWay, doneCallback : DoneFunc){
		quick.login({
            success: (res:any) =>{
                log.d("login success data = " + res);
				doneCallback({
					openId : res.uid,
					icon : res.icon,
					nickname : res.nickname,
					loginWay : LoginWay.WEB_MEIZU,
				})
            },
            fail: (res:any) =>{
                var data = JSON.stringify(res);
                log.d("login fail data = " + data);
				log.d("==用户没有授权===")
				quick.getIMEI({
					success: (res:any) =>{
						console.log("getIMEI res = " +  res.imei);   
						doneCallback({
							openId : res.imei,
							loginWay : LoginWay.TOURIST,
						})       
					},            
					fail: () =>{                
						console.log("getIMEI fail");           
					}
				});
            },
            complete: () =>{
                log.d("login complete");
            }
        });
	}

	//游客绑定字节账号
	public bindAccount(loginWay : LoginWay, doneCallback : DoneFunc){
		let self = this;
		quick.login({
            success: (res:any) =>{
				log.d("############ mz bindAccount success", res)
				let touristId = JSON.stringify({
					ouuid : self.getTouristToken(),
					sdk : LoginWay.WEB_MEIZU,
					nuuid : res.uid,
				})
				doneCallback({
					openId : touristId,
					icon : res.icon,
					nickname : res.nickname,
					loginWay : LoginWay.WEB_MEIZU,
				})

            },
            fail: (res:any) =>{
                var data = JSON.stringify(res);
                log.d("bindAccount fail data = " + data);
				log.d("==用户没有授权===")
            },
            complete: () =>{
                log.d("bindAccount complete");
            }
        });

	}

	public isSupportGPUBake(){
        return false;
    }

	//震动接口
	public vibrator( ms : number){
		if( ms >= 400){
			//震动 400 ms
			quick.vibrateLong({
				success: (res:any) => {
					console.log("vibrateLong success");
				},
				fail: (res:any) => {
				},
				complete: (res:any) => {
				}
			})
		}else{
			//震动 15 ms
			quick.vibrateShort({
				success: (res:any) => {
					console.log("vibrateShort success");
				},
				fail: (res:any) => {
				},
				complete: (res:any) => {
				}
			})	
		}
    }

    public exitGame(){
		quick.exitGame(); 
	}

}