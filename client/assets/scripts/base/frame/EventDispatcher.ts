import * as cc from 'cc';
const { ccclass} = cc._decorator;

let kAllEvent   = "__AllEventKey__"
export type ListenerFunc = (...param : any[])=>void;
export  type EventType = string | number;

@ccclass("EventListener")
export class EventListener{
    private m_handler: ListenerFunc;
    private m_owner: any;
    private m_count  : number;
    private m_isValid : boolean = true;
    private m_order : number;
    private m_pause : boolean = false;
    private m_event : EventType;

    constructor( event : EventType, handler : ListenerFunc, owner : Object, count : number = -1, order : number = 0){
        this.m_event = event;
        this.m_handler = handler;
        this.m_owner = owner;
        this.m_count = count;
        this.m_order = order;
    }

    public getEvent() : EventType{
        return this.m_event;
    }

    public getOwner() : any{
        return this.m_owner;
    }

    public destroy(){
        this.m_isValid = false;
    }

    public equal( owner : Object, event : EventType | undefined = undefined, handle : ListenerFunc | undefined = undefined){
        if(this.m_owner != owner)
            return false;

        if(event && this.m_event != event){
            return false;
        }

        if(handle && this.m_handler != handle){
            return false;
        }

        return true;
    }

    public getOrder() : number{
        return this.m_order;
    }
    public pause(){
        this.m_pause = true;
    }

    public resume(){
        this.m_pause = false;
    }

    public isValid() : boolean{
        return this.m_isValid;
    }

    public isRunning() : boolean{
        return !this.m_pause;
    }

    public DoCall(param : any){
        this.m_handler.apply(this.m_owner, param);
        if(this.m_count > 0){
            this.m_count --;
        }

        if(this.m_count == 0)
            this.m_isValid = false;
    }
}

@ccclass("EventDispatcher")
export class EventDispatcher{
    private static  s_objectUniquedIdCount = 0;
    private static getObjectUniquedId(o : any)
    {
        if ( typeof o.__objectuniqueid == "undefined" ) {
            Object.defineProperty(o, "__objectuniqueid", {
                value: ++this.s_objectUniquedIdCount,
                enumerable: false,
                writable: false
            });
        }
        return "event_owner_"+o.__objectuniqueid;
    }
    
    private static s_eventDipatcherId = 0;
    private static getDistacherId() : number{
        this.s_eventDipatcherId++;
        return this.s_eventDipatcherId;
    }

    private m_listeners : Map<EventType, Map<string, Array<EventListener>>> = new Map();
    private m_id = 0;
    private m_dispatching = false;
    private m_adds : Array<EventListener> = new Array();

    constructor(){
        this.m_id = EventDispatcher.getDistacherId();
    }

    public getId(){
        return this.m_id;
    }

    public addListenerOnce(event : EventType,  owner : Object, handler : ListenerFunc) : EventListener {
        return this.addListener(event, owner, handler, 1);
    }

    public removeAllListeners(){
        this.m_listeners = new Map();
        this.m_adds = new Array();
    }

    public addListener( event : EventType, owner : Object, handler : ListenerFunc,  count : number = -1, order : number = 0) : EventListener {
        let listener = new EventListener(event, handler, owner, count, order);
        if(!this.m_dispatching){
            let ownerId = EventDispatcher.getObjectUniquedId(owner);
            let onwers = this.m_listeners.get(event);
            if(onwers == null)
            {
                onwers = new Map();
                this.m_listeners.set(event, onwers);
            }
    
            let handlers = onwers.get(ownerId);
            if (handlers == null) 
            {
                handlers = new Array();
                onwers.set(ownerId, handlers);
            }
            
            handlers.push(listener);
            handlers.sort(function(a : EventListener, b : EventListener){
                return b.getOrder() - a.getOrder();
            })
        }else{
            this.m_adds.push(listener);
        }

        return listener;
    }

    public pauseListenerByOwner( owner : Object, event ?: EventType){
        if(owner == null){
            return console.log("the owner must not been null");
        }

        this.m_adds.forEach(( item : EventListener)=>{
            if(item.equal(owner, event)){
                item.pause();
            }
        })

        let ownerId = EventDispatcher.getObjectUniquedId(owner)
        if (event != null) 
        {
            let onwers = this.m_listeners.get(event);
            if(onwers){
                let handles = onwers.get(ownerId);
                handles && handles.forEach(( item : EventListener ) => {
                    item.pause();
                });
            }
        }
        else if(event == null)
        {
            this.m_listeners.forEach(( onwers)=>{
                let handles = onwers.get(ownerId);
                handles?.forEach(( item : EventListener)=>{
                    item.pause();
                })
            })
        }
    }

    public resumeOwner(owner : Object, event ?: EventType){
        if(owner == null){
            return console.log("the owner must not been null");
        }
        
        let ownerId = EventDispatcher.getObjectUniquedId(owner)
        this.m_adds.forEach(( item : EventListener)=>{
            if(item.equal(owner, event)){
                item.resume();
            }
        })
        if (event != null) 
        {
            let onwers = this.m_listeners.get(event);
            if(onwers){
                let handles = onwers.get(ownerId);
                handles && handles.forEach(( item : EventListener ) => {
                    item.resume();
                });
            }
        }
        else if(event == null)
        {
            this.m_listeners.forEach(( onwers)=>{
                let handles = onwers.get(ownerId);
                handles?.forEach(( item : EventListener)=>{
                    item.resume();
                })
            })
        }
    }

    public removeListenerByOwner( owner : Object, event ?: EventType){
        if(owner == null){
            return console.log("the owner must not been null");
        }
        this.m_adds.forEach(( item : EventListener)=>{
            if(item.equal(owner, event)){
                item.destroy();
            }
        })
        
        let ownerId = EventDispatcher.getObjectUniquedId(owner)
        
        if (event != null) 
        {
            let owners = this.m_listeners.get(event);
            owners && owners.delete(ownerId);
            if(owners){
                if(this.m_dispatching){
                    let handles = owners.get(ownerId);
                    handles?.forEach(( item : EventListener)=>{
                        item.destroy();
                    })
                }else{
                    owners.delete(ownerId);
                }
            }
        }
        else if(event == null)
        {
            this.m_listeners.forEach((owners)=>{
                if(this.m_dispatching){
                    let handles = owners.get(ownerId);
                    handles && handles.forEach(( item : EventListener)=>{
                        item.destroy();
                    })
                }else{
                    owners.delete(ownerId);
                }
            })
        }
    }

    public removeListenerByEvent( event : EventType){
        this.m_adds.forEach(( item : EventListener)=>{
            if(item.getEvent() == event){
                item.destroy();
            }
        })

        if(this.m_dispatching){
            let owners = this.m_listeners.get(event);
            if(owners){
                owners.forEach(( handles )=>{
                    handles.forEach(( item : EventListener)=>{
                        item.destroy();
                    })
                })
            }
        }else{
            this.m_listeners.delete(event);
        }
    }

    public removeListener( event : EventType,  owner : Object, handler : ListenerFunc){
        this.m_adds.forEach(( item : EventListener)=>{
            if(item.equal(owner, event, handler)){
                item.destroy();
            }
        })

        let onwers = this.m_listeners.get(event);
        if(onwers == null) return;

        let ownerId = EventDispatcher.getObjectUniquedId(owner);
        let handles = onwers.get(ownerId);
        if(handles == null) return;

        if(this.m_dispatching){
            handles.forEach(( item : EventListener )=>{
                if(item.equal(owner, event, handler)){
                    item.destroy();
                }
            })
        }else{
            let count = handles.length;
            for(let i = count -1; i >= 0; i--){
                let item = handles[i];
                if(item.equal(owner, event, handler)){
                    handles.splice(i, 1);
                }
            }
        }
    }

    
    public dispatch( event : EventType, ...datas : any[]) {
        this.m_dispatching = true;

        let allOnwers = this.m_listeners.get(kAllEvent);
        if (allOnwers) 
        {
            allOnwers.forEach(( handlers )=>{
                handlers.forEach(( item )=>{
                    if(item.isValid()) 
                        item.DoCall(datas);
                })
            })
        }
        
        let onwers = this.m_listeners.get(event);
        if (onwers) 
        {
            onwers.forEach(( handlers )=>{
                handlers.forEach(( item )=>{
                    if(item.isValid())
                        item.DoCall(datas);
                })
            })
        }
        this.m_dispatching = false;
        this.addWaitEvents();
        this.removeUnuseHandle();
    }

    private addWaitEvents(){
        this.m_adds.forEach(( item )=>{
            if(item.isValid()){
                let event = item.getEvent();
                let owner = item.getOwner();
                let ownerId = EventDispatcher.getObjectUniquedId(owner);
                let onwers = this.m_listeners.get(event);
                if(onwers == null)
                {
                    onwers = new Map();
                    this.m_listeners.set(event, onwers);
                }
        
                let handlers = onwers.get(ownerId);
                if (handlers == null) 
                {
                    handlers = new Array();
                    onwers.set(ownerId, handlers);
                }
                
                handlers.push(item);
                handlers.sort(function(a : EventListener, b : EventListener){
                    return b.getOrder() - a.getOrder();
                })
            }
        })
    }
    private removeUnuseHandle()
    {
        let removeEvents : EventType[] = [];
        let eventCount = 0;
        this.m_listeners.forEach(( owners, event )=>{
            let removeOwnerIds : string [] = [];
            let allCount = 0;
            owners.forEach(( handles, ownerId )=>{
                allCount ++;
                let count = handles.length;
                let removeCount = 0;
                for(let i = count -1; i >= 0; i--){
                    let item = handles[i];
                    if(!item.isValid()){
                        removeCount++;
                        handles.splice(i, 1);
                    }
                }
                if(removeCount >= count){
                    removeOwnerIds.push(ownerId)
                }
            })

            if(removeOwnerIds.length >= allCount){
                removeEvents.push(event);
            }else{
                removeOwnerIds.forEach(( ownerId )=>{
                    owners.delete(ownerId);
                })
            }
        })

        removeEvents.forEach((event)=>{
            this.m_listeners.delete(event);
        })
    }

    public addListenerAll(owner : Object, func : ListenerFunc){
        this.addListener(kAllEvent, owner, func)
    }

    public removeListenerAll(owner : Object, func : ListenerFunc){
        this.removeListener(kAllEvent, owner, func)
    }
}