var kServiceMap = {
    // PlayerService: {path:"PlayerService",  autoStart : true,},
}

//service管理器
var ServiceMgr = cc.Class({
    properties: {
        m_services : [],
    },


    init(){
        for (const key in kServiceMap) {
            this.getService(key)
        }
    },

    getService(name){
        if(this.m_services[name] === undefined){
            var config = kServiceMap[name]
            var clsService = require(config.path)
            var obj = new clsService()
            this.m_services[name] = obj
            if (config.autoStart) {
                obj.start()
            }
        }
        return this.m_services[name]
    },

    reset(){
        for (const key in kServiceMap) {
            object.stop()
        }
    },
})

 module.exports = frame.InstanceMgr.createInstance(ServiceMgr)