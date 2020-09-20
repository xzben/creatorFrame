// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

let s_instance = null;

cc.Class({
    extends: cc.Component,

    properties: {

    },

    //
    loadModules(){
        require("config")
        require("log")
        require("frame")
        require("game")
        require("Agui")
        require("platform")
        require("util")
    },

    onLoad () {
        if(s_instance == null){
            s_instance = this;
        }else{
            log.e("GameWorld had repeat!!!!!");
        }
        this.loadModules();
    },

    start () {
        cc.game.addPersistRootNode(this.node);
        game.StoreMgr.getInstance().init();
        game.SoundUtil.getInstance().init();
        game.ResMgr.getInstance().init();
        game.UIMgr.getInstance().init();
        game.SceneMgr.getInstance().init();
        game.ServiceMgr.getInstance().init();

        this.launchGame();
    },

    launchGame(){
        let cls = require("testScenePresenter")
        let obj = new cls()
        obj.show()
    },
    
    // update (dt) {},
});

// 实例持有者
var _static = {   //另一个对象
    getInstance: function() {
        return s_instance;
    }
 };

 module.exports = _static;
