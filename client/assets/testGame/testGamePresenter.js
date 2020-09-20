cc.Class({
    extends: frame.BaseScenePresenter,
    properties: {
       
    },

    getViewPath(){
        return "testGame.game";
    },

    handleOpenScene( scene ){
        game.SceneMgr.getInstance().pushScene(scene, this);
    },
});