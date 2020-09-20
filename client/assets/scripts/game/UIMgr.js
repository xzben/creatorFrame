
//UI管理器
var UIMgr = cc.Class({
    properties: {
        uiControlList : null,
    },

    ctor : function(){
        this.uiControlList = [];
    },

    init(){

    },
    
    //加载面板
    loadRes(resPath, doneCallback ){
        game.ResMgr.getInstance().load(resPath, cc.Prefab, (err, prefab) =>{
            if (!err && doneCallback) {
                var node = cc.instantiate(prefab);
                doneCallback(null, node)
            }else{
                doneCallback( err, null );
            }
        });
    },

    //打开UI面板
    open(uiControl, zorder, parent, needAnim, alpha, needBgColor){
        var root = cc.director.getScene().getChildByName('Canvas');
        if ((root && cc.isValid(root, true)) || (parent && cc.isValid(parent, true))){
            var needAnim = needAnim == undefined ? true : needAnim
            var parent = parent == undefined ? root : parent
            var zorder = zorder == undefined ? 0 : zorder
            var needBgColor = needBgColor == undefined ? true : needBgColor;
    
            if(parent){
                parent.addChild(uiControl.node, zorder);
                if(needBgColor){
                    uiControl.setBgColor(alpha)
                }
    
                if (needAnim) {
                    uiControl.node.setScale(0.5);
                    var action = cc.scaleTo(0.2, 1);
                    action.easing(cc.easeElasticOut(0.8));
                    uiControl.node.runAction(action)  
                } 
                this.uiControlList.push(uiControl);
            }
            else{
                console.log("UIMgr:Open()  scene data not found root!!!!!!!")
            }
        }
    },

    //关闭UI面板
    close(uiControl, needAnim){
        // console.log("UIMgr  Close");
        var func = (node, obj)=>{
            //要先从列表里删除
            obj.node.destroy()
            var index = this.uiControlList.indexOf(obj);
            if (index !== -1) {
                this.uiControlList.splice(index, 1);
            }
        }
        var needAnim = needAnim == undefined ? true : needAnim
        if (needAnim) {
            var action = cc.scaleTo(0.08, 0);
            action.easing(cc.easeElasticIn(0.8));
            uiControl.node.runAction(cc.sequence(action, cc.callFunc(func, this, uiControl))) 
        }else{
            uiControl.node.runAction(cc.callFunc(func, this, uiControl)) 
        }   
    },
})

module.exports = frame.InstanceMgr.createInstance(UIMgr)
