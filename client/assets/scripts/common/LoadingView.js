cc.Class({
	name : "LoadingView",
    extends: require("BaseView"),
    properties: {
        tips        : cc.Label,
        loading     : cc.Node,
        dt          : 1.6,
    },

    onLoad() {
        this._super();
        let dt = this.dt;
        this.loading.runAction(cc.repeatForever( cc.rotateBy(dt, 360)));
    },

	setTxtLoading(msg){
		this.tips.string = msg != undefined ? msg : "" 
	},
});
