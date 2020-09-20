

var SceneMgr = cc.Class({
    properties: {
    },

	init(){
		this.m_curScenePresenter = null;
		this.m_sceneStack = [];
	},
	
	runScene( scene, presenter ){
		this.m_curScenePresenter = presenter
		cc.director.runScene(scene);
	},

	pushScene( scene, presenter ){
		this.m_curScenePresenter.clearSceneNode();
		this.m_sceneStack.push(this.m_curScenePresenter)
		this.runScene(scene, presenter)
	},

	popScene(){
		if(this.m_sceneStack.length <= 0) return;
		this.m_curScenePresenter = this.m_sceneStack.pop()
		this.m_curScenePresenter.show()
	},
})

module.exports = frame.InstanceMgr.createInstance(SceneMgr)