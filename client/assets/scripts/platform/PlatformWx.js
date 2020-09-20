let PlatformBase = require("PlatformBase")
var WXBizDataCrypt = require('WXBizDataCrypt')

let PlatformWx = cc.Class({
	extends: PlatformBase,
	
	ctor(){
		this.videoAdInit()
	},

	//保持屏幕不熄灭
	setKeepScreenOn( keepScreenOn ){
		wx.setKeepScreenOn({
			keepScreenOn : keepScreenOn,
		})
	},

	videoAdInit(){
		// 创建激励视频广告实例，提前初始化 
		if (wx.createRewardedVideoAd) { //有可能不存在这个函数
			let adUnitId = ""
			this.videoAd = wx.createRewardedVideoAd({ adUnitId: adUnitId })
			this.videoAd.load()

			//广告加载失败，关闭广告
			this.videoAd.onError(err => {
				log.d(`this.videoAd.onError ${err.errMsg} ${err.errCode}`)
				this.loadVideoAdError = true;
			})

			this.videoAd.onClose(res => {
				// 用户点击了【关闭广告】按钮
				if (res && res.isEnded || res === undefined) {
				}
				else {
				}
			})
		}
	},

	videoAdShow(){
		// 用户触发广告后，显示激励视频广告 
		this.videoAd.show().catch(() => {
			// 失败重试 
			this.videoAd.load()
				.then(() => this.videoAd.show())
				.catch(err => { log.d('激励视频 广告显示失败') })
		})
	},

	getVideoAdError(){
		return this.loadVideoAdError;
	},

	getGameLaunchOptions(){//获取游戏启动参数
		return wx.getLaunchOptionsSync()
	},

	//联系客服
	contactService() {
		wx.openCustomerServiceConversation({
			showMessageCard: true,
			success: function (data) {
				log.d("success =", data)
			},
			fail: function (data) {
				log.d("fail =", data)
			},
			complete: function (data) {
				log.d("complete =", data)
			}
		})
	},

	getPlatfromType(){
		return 1
	},

	getSystemInfoSync(){
		const res = wx.getSystemInfoSync()
		return res
	},

	//检测是否授权
	checkAuth(doneCallback, type){
		wx.getSetting({
		    success(res) {
		        if (res.authSetting[type]) {
					doneCallback(true)
		        }else{
					wx.authorize({
			        	scope: type,
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
	},

	//创建隐性的登录按钮
	createUserInfoButton(node, doneCallback, btnCallback){
		wx.getSystemInfo({
			success(res) {
				var scalex = res.screenWidth/cc.winSize.width
				var scaley = res.screenHeight/cc.winSize.height
				var scale = scalex > scaley ? scaley : scalex
				var pos = node.convertToWorldSpace(cc.v2(0,0))
				var xx = scalex*(pos.x)
				var yy = res.screenHeight - scaley*(pos.y + node.height)
				// log.d("======createUserInfoButton=======", cc.winSize, scalex, scaley)
				// log.d("======createUserInfoButton=======node:", pos, node.width, node.height, xx, yy)
				var width = scale*(node.width)
				var height = scale*(node.height)
				var button = wx.createUserInfoButton({
						                        type: "text",
						                        text: "",
						                        style: {
						                            left: xx,
						                            top: yy,
						                            width: width,
						                            height: height,
													lineHeight:40,
													backgroundColor:'#00000000',
													color:'#ffffff',
													borderRadius: 4,
						                        }
				})

				button.onTap((res1) => {
					log.d("==button.onTap===")
					wx.getSetting({
						success(res) {
							if(res.authSetting["scope.userInfo"]){
								log.d("==已经授权===")
								if (btnCallback) {
									btnCallback(true)
								}
							}else{
                                log.d("==拒绝授权===")
								if (btnCallback) {
									btnCallback(false)
								}
							}
						},
						fail(){
							log.d("==拒绝授权===")
							if (btnCallback) {
								btnCallback(false)
							}
						}
					})
				})

				if (doneCallback) {
					doneCallback(button)
				}
			}
		})
	},


	//小游戏登录
	login( doneCallback ){
		var self = this
		this.checkAuth(( success )=>{
			if(success){
				wx.login({
					success : function(loginData){
						log.d("############ login success", loginData)
						let code = loginData.code
						wx.getUserInfo({
							success(infoData){
								log.d("############ getUserInfo", infoData)
								var accessToken = 'appid='+wxAppId+'&secret='+wxSecret+'&js_code='+code+'&grant_type=authorization_code'
								log.d("###########accessToken ", accessToken)
								// var url = 'https://api.weixin.qq.com/sns/jscode2session?'+accessToken
								// wx.request({
								// 	　　　　　　url: url,
								// 	　　　　　　method: 'GET',
								// 	　　　　　　success: function(res){
								// 	　　　　　　　　 log.d("#####11####", res)
								// 					if (res.statusCode == 200) {
								// 						var pc = new WXBizDataCrypt(wxAppId, res.data.session_key)
								// 						var data = pc.decryptData(infoData.encryptedData , infoData.iv)
								// 						log.d('decode data: ', data)
								// 					}
								// 	　　　　　　}
								// 	　　　　})
								doneCallback(true, data)
							}
						})
					}
				})
			}else{
				log.d("==用户没有授权===")
			}
		}, 'scope.userInfo')
	},


	//title:转发标题，不传则默认使用当前小游戏的昵称
	//imageUrl:转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4
	//wx.onShow() 获取启动参数中的 query数据
	share(title, imageUrl, data){
		var query = ""
		var isFirst = true
		for(var key in data)
		{
			if(!isFirst)
				query += "&"
			isFirst = false
			query +=  key + '=' + data[key]
		}

		wx.shareAppMessage({
			title : title,
			imageUrl : imageUrl,
			query : query,
		})
	},

})

export default PlatformWx