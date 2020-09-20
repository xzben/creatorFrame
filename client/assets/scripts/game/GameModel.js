var GameModel = cc.Class({
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
        return ret ? ret : "unknow"
    },

})

 module.exports = frame.InstanceMgr.createInstance(GameModel);