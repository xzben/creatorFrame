const net = require("../../../scripts/net/net");

cc.Class({
    extends: frame.BasePresenter,
    properties: {
       
    },
    ctor(){

    },

    show(){

        let sourceData = {
            clientTime : 11111,
            serverTime : 22222,
        }
        let buffer = net.ProtoRegister.getInstance().encodeMessage(net.PbCmd.C2S.HEART, sourceData, 1)

        log.d("########### encode result:", sourceData, buffer );

        let { cmd, session, data } = net.ProtoRegister.getInstance().decodeMessage(buffer)

        log.d("############## proto test ##################")
        log.d("########### cmd ", cmd, " session:", session)
        log.d(data);
    },
});