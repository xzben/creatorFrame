const net = require("../scripts/net/net");
// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const Network = require("../scripts/net/Network");

let s_instance = null;

cc.Class({
    extends: cc.Component,

    properties: {

    },

    //
    loadModules(){
        require("config");
        require("constant")
        require("frame");
        require("common")
        require("log");
        require("game");
        require("Agui");
        require("net");
        require("platform");
        require("util");
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
        this.loadModules();
        cc.game.addPersistRootNode(this.node);
        game.StoreMgr.getInstance().init();
        game.SoundUtil.getInstance().init();
        game.ResMgr.getInstance().init();
        game.UIMgr.getInstance().init();
        game.SceneMgr.getInstance().init();
        game.GameModel.getInstance().init();
        game.ServiceMgr.getInstance().init();

        log.d("################ winsize", cc.winSize)
        this.m_worldInited = false;
        net.Network.getInstance().init( ()=>{
            this.m_worldInited = true;
            this.launchGame();
        });
    },

    update(dt){
        if(!this.m_worldInited) return;

        net.Network.getInstance().update(dt);
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
