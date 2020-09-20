let BasePresenter = require("BasePresenter")
let BaseScenePresenter = cc.Class({
    extends: BasePresenter,

    ctor(viewpath){
        this.clearSceneNode();
    },

    start(){

    },

    clearSceneNode(){
        this.m_sceneNode = null;
    },

    handleOpenScene( scene ){
        game.SceneMgr.getInstance().runScene(scene, this);
    },

    // scene 能触发close 一般都是 push 的scene，否则就应用新的scene直接show不应该触发close事件
    close(){
        game.SceneMgr.getInstance().popScene();
    },
    show(){
        let resPath = this.m_viewPath;
        if(resPath == null)
            resPath = this.getViewPath();

        game.ResMgr.getInstance().loadScene(resPath, (err, sceneAsset)=>{
            this.m_sceneNode = sceneAsset.scene
            let canvas = this.m_sceneNode.getChildByName('Canvas');
            let baseNode = canvas.getComponent(frame.BaseNode)
            baseNode.setPresenter(this);
            this.m_delegate = baseNode;
            this.handleOpenScene(this.m_sceneNode)
        })
    },


})

module.exports = BaseScenePresenter;