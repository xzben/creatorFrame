var GameModel = cc.Class({
    name: "GameModel",
    
	properties: {
        m_strMap : [],
    },

    ctor(){
    
    },

    init(){
        game.ResMgr.getInstance().load('strings', (err, jsonAsset) => {
            if (err) {
                    cc.log(err)
            }else{
                this.m_strMap = jsonAsset.json
            }
        })
    },

    getText( key ){
        var ret = this.m_strMap[key]
        if (ret == null) {
            ret = key
            log.w("can't find the text by key: ", key)
        }
        return ret
    },

    tryGetText( key ){
        let ret = this.m_strMap[key]

        return ret == null ? key : ret;
    },

})

 module.exports = frame.InstanceMgr.createInstance(GameModel);