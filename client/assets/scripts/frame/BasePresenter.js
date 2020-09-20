var BasePresenter = cc.Class({
    ctor( viewpath ){
        this.m_isCloseView = true
        this.m_viewPath = viewpath;
        this.m_delegate = null;
        this.m_listenerDispathers = [];
    },

    getViewPath(){
        log.e("please overwrite this func to get viewpath!!!");
        return "thepathname";
    },

    show(zorder, parent, needAnim, alpha, needBgColor){
        if(this.m_delegate == null){

            let resPath = this.m_viewPath;
            if(resPath == null)
                resPath = this.getViewPath();
            this.m_isCloseView = false
            game.ResMgr.getInstance().load(resPath, cc.Prefab, (err, prefab) =>{
                if(!this.m_isCloseView){
                    var node = cc.instantiate(prefab);
                    let baseNode = node.getComponent(frame.BaseNode)
                    baseNode.setPresenter(this);
                    this.m_delegate = baseNode;
                    game.UIMgr.getInstance().open(baseNode, zorder, parent, needAnim, alpha, needBgColor);
                }
            });
        }
    },

    close( needAnim ){
        this.m_isCloseView = true
        game.UIMgr.getInstance().close(this.m_delegate, needAnim)
        this.m_delegate = null;
    },

    onLoad(){
        log.d("######### BasePresenter onLoad")
    },

    start(){
        log.d("######### BasePresenter start")
    },

    onEnable(){
        log.d("######### BasePresenter onEnable")
    },

    onDisable(){
        log.d("######### BasePresenter onDisable")
    },

    onDestroy(){
        log.d("######### BasePresenter onDestroy")
    },

    // 方便的事件监听接口，会自动释放监听
    on(dispatcher, event, funcName, count, order){
        if(!(dispatcher instanceof game.EventDispatcher)){
            log.e("param dispatcher is not valid, must been game.EventDispather object!");
            return;
        }

        let handler = this[funcName];
        if(typeof(handler) != "function")
        {
            log.e("the funcName:%s is not valid", funcName);
            return;
        }

        dispatcher.on(event, handler, this,count, order)
        this.m_listenerDispathers.push(dispatcher);
    },

    once(dispatcher, event, funcName){
        return this.on(dispatcher, event, funcName, this, 1);
    },

    clearEvents(){
        for(let i = 0; i < this.m_listenerDispathers.length; i++)
        {
            let dispatcher = this.m_listenerDispathers[i]
            dispatcher.offOwner(this);
        }
        this.m_listenerDispathers = [];
    }

})

module.exports = BasePresenter;