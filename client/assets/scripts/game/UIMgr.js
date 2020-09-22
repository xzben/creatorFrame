
//UI管理器
var UIMgr = cc.Class({
    name: "UIMgr",
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
                    uiControl.showAnim(()=>{
                    })
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
            if(cc.isValid(obj.node)){
                obj.node.destroy()
            }
            
            var index = this.uiControlList.indexOf(obj);
            if (index !== -1) {
                this.uiControlList.splice(index, 1);
            }
        }
        var needAnim = needAnim == undefined ? true : needAnim
        if (needAnim) {
            uiControl.closeAnim(()=>{
                func(null, uiControl);
            })
        }else{
            uiControl.node.runAction(cc.callFunc(func, this, uiControl)) 
        }   
    },
})

module.exports = frame.InstanceMgr.createInstance(UIMgr)
