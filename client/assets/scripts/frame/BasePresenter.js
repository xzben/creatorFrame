var BasePresenter = cc.Class({
    ctor( viewpath ){
        this.m_isCloseView = true
        this.m_viewPath = viewpath;
        this.m_delegate = null;
        this.m_listenerDispathers = [];

        this.m_loadViewTag = 0;  // 避免多次加载界面导致的重复加载显示
    },

    clearDelegate(){
        this.m_delegate = null;
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
            this.m_loadViewTag++;
            let tag = this.m_loadViewTag
            game.ResMgr.getInstance().load(resPath, cc.Prefab, (err, prefab) =>{
                if(tag !== this.m_loadViewTag)  return; // 过滤掉只要最后一次调用加载的node
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
        this.m_isCloseView = true;
        if(this.m_delegate){
            let delegate = this.m_delegate;
            this.m_delegate = null;
            game.UIMgr.getInstance().close(delegate, needAnim)
        }
    },

    onLoad(){
        log.i("######### BasePresenter onLoad", this)
    },

    start(){
        log.i("######### BasePresenter start", this)
    },

    onEnable(){
        log.i("######### BasePresenter onEnable", this)
    },

    onDisable(){
        log.i("######### BasePresenter onDisable", this)
    },

    onDestroy(){
        log.i("######### BasePresenter onDestroy", this)
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