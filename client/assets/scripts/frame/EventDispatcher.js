
var kAllEvent   = "__AllEventKey__"

var uniqueidCount = 0
var getObjectUniquedId = function(o){
    if ( typeof o.__objectuniqueid == "undefined" ) {
        Object.defineProperty(o, "__objectuniqueid", {
            value: ++uniqueidCount,
            enumerable: false,
            writable: false
        });
    }
    return o.__objectuniqueid;
}

var EventDispatcher = cc.Class({
    ctor(){
        this.m_listeners = {}
    },

    // 监听指定event 一次事件
    onOnce : function(event, handler, owner){
        this.on(event, handler, owner, 1);
    },

    //
    on : function (event, handler, owner, count, order) {
        let ownerId = getObjectUniquedId(owner)
        if(count == null || count === undefined)
        {
            count = -1;
        }
        var onwers = this.m_listeners[event];
        if(onwers === undefined)
        {
            onwers = {}
            this.m_listeners[event] = onwers
        }
        var handlers = onwers[ownerId]
        if (handlers === undefined) 
        {
            handlers = [];
            onwers[ownerId] = handlers;
        }
        var item = {
            handler: handler,
            owner: owner,
            count  : count,
            isValid : true,
            order : order || 0,
        };
        handlers.push(item);

        handlers.sort(function(a, b){
		    return b.order - a.order
        })
        return item;
    },

    offOwner : function( owner, event){
        if (owner === undefined) {
            return console.log("the owner must not been null")
        }
        let ownerId = getObjectUniquedId(owner)
        var onwers = this.m_listeners[event];
        if (event !== undefined && onwers !== undefined ) {
            onwers[ownerId] = []
        }else if(event === undefined){
            for(var key in this.m_listeners)
            {
                var handlers = this.m_listeners[key]
                if(handlers[ownerId] !== undefined)
                {
                    delete handlers[ownerId]
                }    
            }
        }
    },

    off : function (event, handler, owner) {
        var onwers = this.m_listeners[event];
        if (onwers !== undefined) 
        {
            for(var key in onwers)
            {
                var handlers = onwers[key]
                var size = handlers.length;
                for (var i = size; i >  0; i--) 
                {
                    var item = handlers[i-1];
                    if (item.handler === handler && item.owner === owner) 
                    {
                        handlers.splice(i, 1);
                    }
                }
            }
        }
    },


    event : function () {
        var event = arguments[0]
        var datas = []
        for(var i = 1; i < arguments.length;i++){
            datas.push(arguments[i])
        }
        var onwers = this.m_listeners[kAllEvent];
        if (onwers !== undefined) 
        {
            for(var key in onwers)
            {
                var handlers = onwers[key];
                var size = handlers.length;
                for (var i = 0; i < size; i++) 
                {
                    var ef = handlers[i];
                    if(ef.isValid)
                    {
                        var handler = ef.handler;
                        var owner = ef.owner;
                        try{
                            handler.apply(owner, datas);
                        }
                        catch(err)
                        {
                            log.tryError(err);
                        }
                    }
                    
                    if(ef.count > 0)   
                        ef.count -= 1;

                    if(ef.count == 0)
                        ef.isValid = false;
                }
            }
        }
        
        var onwers = this.m_listeners[event];
        if (onwers !== undefined) 
        {
            for(var key in onwers)
            {
                var handlers = onwers[key];
                var size = handlers.length;
                for (var i = 0; i < size; i++) 
                {
                    var ef = handlers[i];
                    if(ef.isValid)
                    {
                        var handler = ef.handler;
                        var owner = ef.owner;
                        try{
                            handler.apply(owner, datas); 
                        }catch(err)
                        {
                            log.tryError(err);
                        }
                    }

                    if(ef.count > 0)   
                        ef.count -= 1;
                    if(ef.count == 0)
                        ef.isValid = false;
                }
            }
        }
        this.removeUnuseHandle();
    },

    removeUnuseHandle()
    {
        for (var event in this.m_listeners)
        {
            var onwers = this.m_listeners[event];
            for (var key in onwers)
            {
                var handlers = onwers[key];
                var size = handlers.length;
                for (var i = size; i > 0; i--) 
                {
                    var ef = handlers[i - 1];
                    if (!ef.isValid)
                    {
                        handlers.splice(i - 1, 1);
                    }
                }
            }
        }
    },

    onAll(func, owner){
        this.on(kAllEvent, func, owner)
    },

    offAll(func, owner){
        this.off(kAllEvent, func, owner)
    },

})

module.exports = EventDispatcher;