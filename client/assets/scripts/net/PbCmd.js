let PbCmd = {}

//---------------- 客户端发给服务器的 --------------------------
PbCmd.C2S = {}
PbCmd.C2S.HEART					= 100;    //--心跳
PbCmd.C2S.LOGIN 				= 101;	  //--登录
PbCmd.C2S.REQ_ITEM_LIST			= 102;    //--获取玩家全部的Items
PbCmd.C2S.REQ_PROP_LIST			= 103;    //--获取玩家全部的属性
//----------------- 服务器发给客户端的 -------------------------

PbCmd.S2C = {}
PbCmd.S2C = {}
PbCmd.S2C.SESSION 				= 1		  //--收包确认
PbCmd.S2C.HEART 				= 100;    //--心跳收报
PbCmd.S2C.LOGIN 				= 101; 	  //--登录返回
PbCmd.S2C.RESP_ITEM_LIST		= 102;    //--获取玩家全部的Items
PbCmd.S2C.RESP_PROP_LIST		= 103;    //--获取玩家全部的属性

module.exports = PbCmd;