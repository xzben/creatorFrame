let PbCmd = require("PbCmd")

let netConfig = {}
//---------------- 客户端发给服务器的 --------------------------
netConfig.C2S = {}
netConfig.C2S = {}
netConfig.C2S[PbCmd.C2S.HEART] 			        = { file : "proto/common", message : "common.Heart" };
netConfig.C2S[PbCmd.C2S.LOGIN] 			        = { file : "proto/normal", message : "normal.LoginReq" };
netConfig.C2S[PbCmd.C2S.REQ_ITEM_LIST] 			= { file : "proto/common", message : "common.Emtpy" };
netConfig.C2S[PbCmd.C2S.REQ_PROP_LIST] 			= { file : "proto/common", message : "common.Emtpy" };

//----------------- 服务器发给客户端的 -------------------------
netConfig.S2C = {}
netConfig.S2C[PbCmd.S2C.SESSION] 		        = { file : "proto/common", message : "common.Emtpy" };
netConfig.S2C[PbCmd.S2C.HEART] 			        = { file : "proto/common", message : "common.Heart" };
netConfig.S2C[PbCmd.S2C.LOGIN] 			        = { file : "proto/normal", message : "normal.LoginResp" }; 
netConfig.S2C[PbCmd.S2C.RESP_ITEM_LIST] 		= { file : "proto/normal", message : "normal.ItemList" }; 
netConfig.S2C[PbCmd.S2C.RESP_PROP_LIST] 		= { file : "proto/normal", message : "normal.PropertyList" };

module.exports = netConfig