let s_instances = {}
let uniqueidCount = 0
let getObjectUniquedId = function(o){
    if ( typeof o.__objectuniqueid == "undefined" ) {
        Object.defineProperty(o, "__objectuniqueid", {
            value: ++uniqueidCount,
            enumerable: false,
            writable: false
        });
    }
    return o.__objectuniqueid;
}

module.exports = {
    createInstance( cls ){
        return {
            getInstance(){
                let uid = getObjectUniquedId(cls);
                if(null == s_instances[uid]){
                    s_instances[uid] = new cls();
                }

                return s_instances[uid];
            }
        }
    },

    clearInstance(){
        s_instances = {}
    }    
}