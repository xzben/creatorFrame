let PbCmd = require("PbCmd")

let netConfig = {}
//---------------- 客户端发给服务器的 --------------------------
netConfig.C2S = {}
netConfig.C2S = {}
netConfig.C2S[PbCmd.C2S.HEART] 			        = { message : "common.Heart" };
netConfig.C2S[PbCmd.C2S.LOGIN] 			        = { message : "normal.LoginReq" };
netConfig.C2S[PbCmd.C2S.REQ_ITEM_LIST] 			= { message : "common.Emtpy" };
netConfig.C2S[PbCmd.C2S.REQ_PROP_LIST] 			= { message : "common.Emtpy" };

//----------------- 服务器发给客户端的 -------------------------
netConfig.S2C = {}
netConfig.S2C[PbCmd.S2C.SESSION] 		        = { message : "common.Emtpy" };
netConfig.S2C[PbCmd.S2C.HEART] 			        = { message : "common.Heart" };
netConfig.S2C[PbCmd.S2C.LOGIN] 			        = { message : "normal.LoginResp" }; 
netConfig.S2C[PbCmd.S2C.RESP_ITEM_LIST] 		= { message : "normal.ItemList" }; 
netConfig.S2C[PbCmd.S2C.RESP_PROP_LIST] 		= { message : "normal.PropertyList" }; 

module.exports = netConfig