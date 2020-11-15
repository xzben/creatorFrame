cc.Class({
    extends: frame.BaseView,

    properties: {
        btn_connect : {default : null,type: cc.Node,},
        btn_login : {default : null,type: cc.Node,},
    },

    onLoad(){
        this._super();

        util.addClickCallback(this.btn_connect, ()=>{
            this.handleConnect();
        });

        util.addClickCallback(this.btn_login, ()=>{
            this.handleLogin();
        });
    },

    handleConnect()
    {
        net.Network.getInstance().startNetwork();
    },

    handleLogin()
    {   
        let data = {
            type : 1,
            clientResVersion : 1,
            clientFullVersion : 1,
            uuid : "",
            platform : 1,
            token : "token",
            safeToken : "safeToken",
        };

        net.Network.getInstance().sendMsg(net.PbCmd.C2S.LOGIN, data);
    },
    start () {
       
    },

});
