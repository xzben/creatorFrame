// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

//---------------- 客户端发给服务器的 --------------------------
const enum CMDC2S{
    HEART = 100,    //--心跳
    LOGIN = 101,	  //--登录
    REAL_AUTH = 102, 	  //--玩家实名认证

    MATCH_ROOM      = 2001,  //--匹配房间
    EXIT_GAME	    = 2002,    //--退出游戏
    SETTLEMENT_GAME = 2003,   //--结算游戏
    GET_BATTLE_REWARD 	= 2004,   	//--获取战斗奖励

    SET_USE_HERO 		= 3001,  	//--设置当前使用的英雄
    REQ_VIEW_AD			= 3002, 	//--请求观看视频奖励
    REQ_GET_HERO 		= 3003, 	//--英雄商城观看完视频获得英雄碎片
    REQ_GET_TRY_HERO 	= 3004, 	//--请求当前能试用的英雄
    REQ_MERGE_HERO 	    = 3005, 	//--请求合成英雄
    REQ_UPLEVEL_SKILL		= 3101, 	//--请求升级技能

    GET_LOGIN_REWARD = 301, 		//--领取今天的登录奖励
    REQUEST_TURN_TABLE 	= 302, //-请求转盘
    REQ_GET_POWER 		= 303, //-请求获取体力
    REQ_GET_DIAMOND 	= 304, //-请求获取钻石
    REQ_ACHIEVE_REWARD 	= 305, 	//--请求成就奖励
    REQ_SUM_REWARD 		= 306, 	//--请求转盘累计奖励
    REQ_SHARE_VIDEO_REWARD  = 307, 	 //--请求分享抖音视频奖励
    REQ_FINISH_GUIDE 	= 308, 		//--请求新手引导完成

    GET_EMAIL_LIST		= 401, 		//--读取玩家的邮件列表
    READ_EMAIL 			= 402, 		//--读邮件
    DELETE_EMAIL 		= 403,	//--删邮件

    REQ_RANK_LIST 		= 501,      //--请求排行榜列表

    //---- battle -- >= 10000 则代表子游戏的协议
    MOVE_OPERATE    = 10001,  //--玩家的移动操作
    BATTLE_READY    = 10002,  //--玩家准备好了
    PLAY_SKILL      = 10003,  //--玩家的移动操作
    OTHER_GAME_OP   = 10004,  //--玩家其它操作

    LOADING_PRCESS = 11002, //--玩家加载进度

    RECONNECT_GAME = 12001,  //--重连回战斗
    GET_GAME_FRAME = 12002,  //--重连进入场景后请求当前游戏帧数据
}

//----------------- 服务器发给客户端的 -------------------------

const enum CMDS2C{
    SESSION = 1,		  //--收包确认
    HEART = 100,    //--心跳收报
    LOGIN_OTHER = 3, 	  //--其它地方登陆了
    LOGIN = 101, 	  //--登录返回
    REAL_AUTH				= 102, 	 //--玩家实名认证

    UPDATE_ITEM 			= 201,    //--玩家身上道具数量变化
    UPDATE_PROPERTY 		= 202,    //--玩家身上属性发现变化

    LOGIN_REWARD_RESP 	= 301, //--登录奖励领取返回
    TURN_TABLE_RESULT	= 302,	//--转盘结果
    RESP_GET_POWER 		= 303,	//--请求获取体力
    RESP_GET_DIAMOND 	= 304,	//--请求获取钻石
    RESP_ACHIEVE_REWARD = 305, 	//--请求成就奖励
    RESP_SUM_REWARD 	= 306, 	//--请求转盘累计奖励
    RESP_SHARE_VIDEO_REWARD       = 307, //--请求实名认证
    RESP_FINISH_GUIDE 	= 308, 		//--请求新手引导完成
    //--email
    EMAIL_LIST_RESP		= 401,  //--请求邮件列表返回

    RESP_RANK_LIST 		= 501,    //--排行榜列表

    MATCH_ROOM			= 2001,		//--匹配房间返回
    EXIT_GAME	    = 2002,    //--退出游戏
    SETTLEMENT_GAME = 2003,   //--结算游戏
    GET_BATTLE_REWARD 	= 2004,   	//--获取战斗奖励

    //---- battle -- >= 10000 则代表子游戏的协议
    BATTLE_START		= 11000, //--战斗开始
    GAME_FRAME			= 11001,  //--游戏帧
    ALL_READY 	        = 11002,  //--所有玩家都准备完成
    LOADING_PROCESS     = 11003, //--玩家的加载进度

    RECONNECT_GAME    = 12001,  //--玩家重连消息
    RESP_GAME_FRAME   = 12002,  //--玩家重连消息
    NOTIFY_PLAYER_EXIT 	= 12101,     //--服务器主动通知玩家离开游戏
    
    GAME_OVER   = 12003,  //--游戏结束
    SET_USE_HERO 			= 3001,  	//--设置当前使用的英雄
    RESP_VIEW_AD			= 3002, 	//--观看视频奖励
    RESP_GET_HERO 		= 3003, 	//--英雄商城观看完视频获得英雄碎片
    RESP_GET_TRY_HERO 	= 3004, 	//--当前能试用的英雄
    RESP_MERGE_HERO 	= 3005, 	//--合成英雄
    RESP_UPLEVEL_SKILL		= 3101, 	//--请求升级技能返回
}

export { CMDC2S, CMDS2C }
