
import * as cc from 'cc';
import { getCurEnv } from '../../config/Env';
import { DoneFunc, PlatformBase } from './platformBase';
import { PlatformType } from '../../config/PlatformConfig';
import { getGameControlRootUrl } from '../../config/NetworkConfig';
const { ccclass, property } = cc._decorator;

let tempWind : any = window;
let mini : any = tempWind.wx || tempWind.qq || tempWind.tt || tempWind.swan;


//微信小游戏
@ccclass('platformH5')
export class platformH5 extends PlatformBase{
	protected m_menuShareData : any = {
		title : "你能赢几场？",
		imageUrl : getGameControlRootUrl() + "res/share/share_500x400.jpg",
	};

    public isIOS(): boolean {
		//@ts-ignore
		const sys = mini.getSystemInfoSync();
		const isIOS = sys.system.indexOf('iOS') >= 0;
        
		return isIOS;
    }

	//设置小游戏菜单分享数据
	public setMenuShare(title : string, imageUrl : string, data ?: any){
		let query = "";
		let isFirst = true;
		data = data ? data : {};
		for(let key in data){
			if(!isFirst)
				query += "&"
			isFirst = false
			query +=  key + '=' + data[key]
		}
		this.m_menuShareData.title = title;
		this.m_menuShareData.imageUrl = imageUrl;
		this.m_menuShareData.query = query;
	}

	//设置检测更新回调
	public onCheckUpdate(doneCallback : DoneFunc){
		if (typeof mini.getUpdateManager === 'function') { //请在使用前先判断是否支持
			let isDone = false;
			if (!this.hasUpdate()) {
				isDone = true;
				doneCallback(false);
			}
			const updateManager = mini.getUpdateManager()
			updateManager.onCheckForUpdate((res : any)=> {
				// 请求完新版本信息的回调
				console.log("===onCheckUpdate===" + res.hasUpdate)
				this.m_hasUpdate = res.hasUpdate; 
				if(!isDone){
					isDone = true;
					doneCallback(this.hasUpdate())
				}
			})

			updateManager.onUpdateReady(function () {
				mini.showModal({
					title: '更新提示',
					content: '新版本已经准备好，是否重启应用？',
					success: function (res : any) {
						updateManager.applyUpdate()
					}
				})
			})

			updateManager.onUpdateFailed(function () {
				// 新版本下载失败
				mini.showModal({
					title: "已经有新版本了哟~",
					content: "新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~"
				});
			})
		}else{
			//小游戏没有检测更新的函数，默认不需要更新
			doneCallback(false);
		}
	}


	
    //检测是否授权
	protected checkAuth(doneCallback : DoneFunc, scope : string){
		mini.getSetting({
		    success(res:any) {
		        if (res.authSetting[scope]) {
					doneCallback(true)
		        }else{
					mini.authorize({
			        	scope: scope,
			        	success() {
			        		doneCallback(true)
			        	},
						fail(){
							doneCallback(false)
						}
			   	 	})
		        }
		    },
			fail(){
				doneCallback(false)
			}
		})
	}

	protected openSetting(doneCallback : DoneFunc){
		mini.openSetting({
			success: (res:any) => {
				console.log("openSetting success");
				doneCallback(true, res.authSetting)
			},
			fail: (err:any) => {
				console.log("openSetting fail");
				doneCallback(false)
			},
			complete: (res:any) => {
				console.log("openSetting complete");
			},
		});	
	}

	//过滤 iPhone 7 / 7 Plus及以下机型
	protected filterIphoneModel(){
		let res = mini.getSystemInfoSync();
		let filters = ['iPhone 3', 'iPhone 4', 'iPhone 5', 'iPhone 6', 'iPhone 7']
		for (let i = 0; i < filters.length; i++) {
			let model = filters[i];
			if (res.model.indexOf(model) > -1) {
				return true;
			}
		}
		return false;
	}

	//获取平台
    public getPlatform() : PlatformType{
        return PlatformType.H5;
    }

	//获得安全区域
	public getSafeArea() {
		let sysInfo = mini.getSystemInfoSync();
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

	//显示好友排行榜
	public showFriendRands(){
        mini.getOpenDataContext().postMessage({
			type : 'engine',
            event: 'showFriendRands',
			env : getCurEnv(),
        });
	}

	//更新自己的开放域数据
	public updateSelfOpenData(winCount : number){
        mini.getOpenDataContext().postMessage({
			type : 'engine',
            event: 'updateSelfData',
			value : winCount,
			env : getCurEnv(),
        });
	}

	//title:转发标题，不传则默认使用当前小游戏的昵称
	//imageUrl:转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4
	//wx.onShow() 获取启动参数中的 query数据
	public share(title : string, imageUrl : string, data? : any){
		let query = "";
		let isFirst = true;
		data = data ? data : {};
		for(let key in data){
			if(!isFirst)
				query += "&"
			isFirst = false
			query +=  key + '=' + data[key]
		}

		let share = {
			title : title,
			imageUrl : imageUrl,
			query : query,
		}
		mini.uma.trackShare(share);
        mini.shareAppMessage(share);
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

	//判断文件是否存在
	public isFileExist(fileName : string) {
		const fileSys = mini.getFileSystemManager();
		const stat = fileSys.statSync(fileName);
		if (stat && stat.isFile()) {
			return true;
		}
		return false;
	}

}