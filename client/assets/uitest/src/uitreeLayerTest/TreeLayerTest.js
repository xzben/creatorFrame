cc.Class({
    extends: frame.BaseView,

    properties: {
        view : {default : null,type: Agui.TreeView,},
    },

    start () {
        var expandData = [
            {
                name : "湖南", 
                citys : [
                    {
                        name : "长沙",
                        citys : 
                        [
                            {name : "芙蓉区"},
                            {name : "岳麓区"},
                        ],      
                    },
                    {
                        name : "株洲",
                        citys : 
                        [
                            {name : "荷塘区"},
                            {name : "石峰区"},
                            {name : "茶陵县"},
                        ],
                    }
                ]
            },
            {
                name : "湖北", 
                citys :
                [
                    {name : "武汉"},
                    {name : "襄阳"},
                ]
            },
            {
                name : "广东", 
                citys : 
                [
                    {name : "广州"},
                    {name : "深圳"},
                    {name : "东莞"},
                ]
            },
            {
                name : "广西", 
                citys : 
                [
                    {name : "南宁"},
                    {name : "玉林"},
                    {name : "桂林"},
                ]
            },
        ]
        this.view.setData(expandData)
        this.view.setChildrenName("citys")
        this.view.reloadData()
        this.view.setClickCallBack((cell, data)=>{
            if (this.view.getExpandStateByIdx(cell.getCellIdx())) {
                this.view.unExpand(cell.getCellIdx())
            }else{
                this.view.expand(cell.getCellIdx())
            } 
        })
    },

});
