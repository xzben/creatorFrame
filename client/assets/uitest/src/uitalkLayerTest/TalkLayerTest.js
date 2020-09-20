cc.Class({
    extends: frame.BaseView,
    properties: {
        view : {default : null,type: Agui.TableView,},
    },

    start () {
        var tempData = []
        tempData.push({isLeft: true,content:"花，早安！"})
        tempData.push({isLeft: false,content:"哥哥，早！ 你今天怎么起这么早啊，这么不多睡一会呢"})
        tempData.push({isLeft: true,content:"睡不着，我想你了~  "})
        tempData.push({isLeft: false,content:"不是很快就国庆节了么，你到时候早点回来吧，我骑摩托车去接你。"})
        tempData.push({isLeft: true,content:"嗯嗯，好！ 到时候路上小心点"})
        tempData.push({isLeft: true,content:"我做饭去了"})
        tempData.push({isLeft: false,content:"嗯嗯，去吧，我在外面散一会步"})
        tempData.push({isLeft: true,content:"好，那我挂了，88"})
        
        this.view.setData(tempData)
        this.view.reloadData()
    },

});
