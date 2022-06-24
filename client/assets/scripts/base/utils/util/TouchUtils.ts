import * as cc from "cc"
import { SoundMgr } from "../../core";

export class TouchUtils{
    /**
     * 当前触摸是否是超出obj的范围的
     */
    public static is_overflow_touch(touch : cc.Touch, obj : cc.Node | cc.Component): boolean {
        let node = (obj instanceof cc.Node) ? obj : obj.node;
        let touch_pos = touch.getUILocation()
        let transformP = node.parent!.getComponent(cc.UITransform)!;
        let transformC = node!.getComponent(cc.UITransform)!;
        let local_pos = transformP.convertToNodeSpaceAR(cc.v3(touch_pos.x, touch_pos.y, 0))

        if(transformC.getBoundingBox().contains(cc.v2(local_pos.x, local_pos.y))){
            return false
        }
        return true
    }

    /**
     * 触摸过滤部分区域的消息事件
     */
    public static addTouchFilterCallback(node : cc.Node, callback : (...param:any[])=>void, filterObjs : [cc.Node]){
        let _checkFilter = (touch : cc.Touch)=>{
            for (let key in filterObjs) {
                let obj = filterObjs[key]
                if (! this.is_overflow_touch(touch, obj)) {
                    return true
                }
            }
            return false
    }

        let istouchBegan = false
        node.on(cc.Node.EventType.TOUCH_START, (touch : cc.Touch, event : cc.EventTouch)=>{
            if (_checkFilter(touch)) {
                istouchBegan = false
            }else{
                istouchBegan = true
            }
        }, node)
        node.on(cc.Node.EventType.TOUCH_MOVE, (touch : cc.Touch, event : cc.EventTouch)=>{

        }, node)
        node.on(cc.Node.EventType.TOUCH_END, (touch : cc.Touch, event : cc.EventTouch)=>{
            if (istouchBegan && callback) {
                callback(touch, event)
            }
        }, node)
        node.on(cc.Node.EventType.TOUCH_CANCEL, (touch : cc.Touch, event : cc.EventTouch)=>{
            
        }, node)
    }

    public static addClickCallback( widget : cc.Node | cc.Button | null, callback : (...param:any[])=>void){
        if (widget && widget instanceof cc.Button) {
            widget.node.on("click", (...param : any[])=>{
                callback(...param)
                SoundMgr.getInstance().playEffectByName("click");
            }, widget);
        }else if (widget && widget instanceof cc.Node){
            var comp = widget.getComponent(cc.Button)
            if (comp == null) {
                widget.addComponent(cc.Button)
            }
            widget.on("click", (...param : any[]) => {
                callback(...param)
                SoundMgr.getInstance().playEffectByName("click");
            }, widget);
        }else{
            console.error("addClickCallback failed")
        }
    }

    public static addClickCallbackFunc(widget : cc.Node | cc.Button | null, owner : Object, funcName : string){
        let func : Function = (owner as any)[funcName];
        if(typeof(func) != "function"){
            console.error("can't find func by name", funcName);
            return;
        }
        this.addClickCallback(widget, (...param : any[])=>{
            func.call(owner, owner, ...param);
        })
    }
}