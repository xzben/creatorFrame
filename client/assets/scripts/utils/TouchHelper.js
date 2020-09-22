
//触摸助手
var TouchHelper = {}

//当前触摸是否是超出obj的范围的
var is_overflow_touch = function(touch, obj){
    var touch_pos   = touch.getLocation()
    var local_pos   = obj.convertToNodeSpace(touch_pos)
    var parent_size = obj.getContentSize()

    if (local_pos.x >= 0 && local_pos.x < parent_size.width &&
       local_pos.y >= 0 && local_pos.y < parent_size.height){
        return false
    }

    return true
}

TouchHelper.is_overflow_touch = is_overflow_touch

TouchHelper.add_touch_and_filter = function(node, callback, filterObjs, swallow){
    var _checkFilter = function(touch){
        for (const key in filterObjs) {
            const obj = filterObjs[key]
            if (! is_overflow_touch(touch, obj)) {
                return true
            }
        }
        return false
    }

    var swallow = swallow == undefined ? true : swallow
    var isEnable = true
    node.setTouchFilterEnable = function(enable){
        isEnable = enable
        if (isEnable) {
            node.on(cc.Node.EventType.TOUCH_START, node.touchBeganHandler);
            node.on(cc.Node.EventType.TOUCH_MOVE, node.touchMovedHandler);
            node.on(cc.Node.EventType.TOUCH_END, node.touchEndedHandler);
            node.on(cc.Node.EventType.TOUCH_CANCEL, node.touchCancelledHandler);
        }else{
            node.off(cc.Node.EventType.TOUCH_START, node.touchBeganHandler);
            node.off(cc.Node.EventType.TOUCH_MOVE, node.touchMovedHandler);
            node.off(cc.Node.EventType.TOUCH_END, node.touchEndedHandler);
            node.off(cc.Node.EventType.TOUCH_CANCEL, node.touchCancelledHandler);
        }
    }

    node.setSwallowTouches = function(isSwallow){
        node.blockInputEvents.enabled = isSwallow && isEnable
    }

    var istouchBegan = false
    var touchBegan = function(touch){
        var touchPos = touch.getLocation()
        if (! isEnable) {
            return istouchBegan = false
        }
        if (_checkFilter(touch)) {
            return istouchBegan = false
        }
        return istouchBegan = true
    }

    var onTouchMoved = function(touch){
    }

    var onTouchEnded = function(touch){
        if (istouchBegan && callback) {
            callback(touch)
        }
    }

    var onTouchCancelled = function(touch){
    }

    node.touchBeganHandler = handler(node, touchBegan);
    node.touchMovedHandler = handler(node, onTouchMoved);
    node.touchEndedHandler = handler(node, onTouchEnded);
    node.touchCancelledHandler = handler(node, onTouchCancelled);
    node.blockInputEvents = node.getComponent(cc.BlockInputEvents)
    if (node.blockInputEvents == undefined) {
        node.blockInputEvents = node.addComponent(cc.BlockInputEvents)
    } 
    node.setTouchFilterEnable(isEnable)
    node.setSwallowTouches(swallow)
}


TouchHelper.add_touch_listener = function(node, callback, filter_overflow, swallow){
	var func_begin  = callback[0]
	var func_end    = callback[1]
	var func_move   = callback[2]
	var func_cancel = callback[3]
    var filter_overflow = filter_overflow == undefined ? false : filter_overflow
    var swallow = swallow == undefined ? false : swallow

    var isEnable = true
    node.setTouchFilterEnable = function(enable){
        isEnable = enable
        if (isEnable) {
            node.on(cc.Node.EventType.TOUCH_START, node.touchBeganHandler);
            node.on(cc.Node.EventType.TOUCH_MOVE, node.touchMovedHandler);
            node.on(cc.Node.EventType.TOUCH_END, node.touchEndedHandler);
            node.on(cc.Node.EventType.TOUCH_CANCEL, node.touchCancelledHandler);
        }else{
            node.off(cc.Node.EventType.TOUCH_START, node.touchBeganHandler);
            node.off(cc.Node.EventType.TOUCH_MOVE, node.touchMovedHandler);
            node.off(cc.Node.EventType.TOUCH_END, node.touchEndedHandler);
            node.off(cc.Node.EventType.TOUCH_CANCEL, node.touchCancelledHandler);
        }
    }

    node.setSwallowTouches = function(isSwallow){
        node.blockInputEvents.enabled = isSwallow && isEnable
    }

    var istouchBegan = false
    var touchBegan = function(touch){
        var touchPos = touch.getLocation()
        if (! isEnable) {
            return istouchBegan = false
        }
        if (filter_overflow && is_overflow_touch(touch, node)) {
            return istouchBegan = false
        }
        if (func_begin) {
            func_begin(touch)
        }
        return istouchBegan = true
    }

    var onTouchMoved = function(touch){
        if (istouchBegan && func_move) {
            func_move(touch)
        }
    }

    var onTouchEnded = function(touch){
        if (istouchBegan && func_end) {
            func_end(touch)
        }
    }

    var onTouchCancelled = function(touch){
        if (istouchBegan && func_cancel) {
            func_cancel(touch)
        }
    }

    node.touchBeganHandler = handler(node, touchBegan);
    node.touchMovedHandler = handler(node, onTouchMoved);
    node.touchEndedHandler = handler(node, onTouchEnded);
    node.touchCancelledHandler = handler(node, onTouchCancelled);
    node.blockInputEvents = node.getComponent(cc.BlockInputEvents)
    if (node.blockInputEvents == undefined) {
        node.blockInputEvents = node.addComponent(cc.BlockInputEvents)
    } 
    node.setTouchFilterEnable(isEnable)
    node.setSwallowTouches(swallow)
}



module.exports = TouchHelper;