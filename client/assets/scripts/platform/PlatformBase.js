var PlatformBase = cc.Class({
	ctor(){
		//监听浏览器粘贴事件
		document.addEventListener("paste", handler(this,function (e){
			if ( !(e.clipboardData && e.clipboardData.items) ) {
				return;
			}
			for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
				var item = e.clipboardData.items[i];
				if (item.kind === "string") {
					item.getAsString(handler(this,function (str) {
						// str 是获取到的字符串
						this.m_strClipboard = str
					}))
					break
				}
			}
			
		}))
	},

	//保持屏幕不熄灭
	setKeepScreenOn( keepScreenOn ){
	},

	videoAdShow(){

	},

	getVideoAdError(){
		return undefined;
	},

	getGameLaunchOptions(){//获取游戏启动参数
		return null
	},

	//联系客服
	contactService() {
	},

	getPlatfromType(){
		return 0
	},

	getSystemInfoSync(){
		return {}
	},

	//检测是否授权
	checkAuth(doneCallback, type){
		doneCallback(false)
	},

	//创建隐性的登录按钮
	createUserInfoButton(node, doneCallback, btnCallback){
		
	},


	//小游戏登录
	login( doneCallback ){
		var self = this
		doneCallback(true, {})  
	},


	//title:转发标题，不传则默认使用当前小游戏的昵称
	//imageUrl:转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4
	//wx.onShow() 获取启动参数中的 query数据
	share(title, imageUrl, data){
		log.d("############## share", title, imageUrl, data)
	},

})

export default PlatformBase