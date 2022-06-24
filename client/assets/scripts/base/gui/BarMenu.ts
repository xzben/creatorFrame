import BarItem from "./BarItem";

import * as cc from 'cc';
const { ccclass, property, requireComponent } = cc._decorator;

@ccclass('BarMenu')
@requireComponent(cc.Layout)
export class BarMenu extends cc.Component {
    private _pool: cc.NodePool = new cc.NodePool();
    private _selectIndex: number = 0;
    protected _datas : any[] = [];

    @property({tooltip : "是否可以重复点击选中目标"})
    public isRepeatClick:boolean = false;

    //点击事件
    @property({
        type: cc.EventHandler,
        tooltip: '点击事件',
    })
    public clickEvents: cc.EventHandler[] = [];

    onLoad() {
    }

    onDestroy() {
        if (this._pool) {
            this._pool.clear(); 
        }     
    }

    getDatas(){
        return this._datas
    }

    getSelectId(){
        return this._selectIndex
    }

    getSelectData(){
        return this._datas[this._selectIndex]
    }

    //获取数据信息
    getCellData(id : number){
        return this._datas[id]
    }

    //通过index获取barItem
    getBarItemAtIndex(index : number){ 
        if (index < 0) {
            return undefined
        }

        let len = this.node.children.length
        for (let n: number = len - 1; n >= 0; n--) {
            let item = this.node.children[n];
            let barItem = item.getComponent(BarItem)!
            if (barItem.getItemIdx() == index) {
                return barItem
            }
        }
        return undefined
    }

    //创建barItem
    createBarItem( id : number ){
        let item = this._pool.get()!
        if (!item) {
            if (this.node.children.length > 0) {
                item = cc.instantiate(this.node.children[0]);
            }
        }
        this.node.addChild(item)

        var barItem = item.getComponent(BarItem)!
        barItem.setItemIdx(id)
        var comp = item.getComponent(cc.Button)
        if (comp == undefined || comp == null) {
            item.addComponent(cc.Button)
        }
        item.targetOff(item)
        item.on("click", ()=>{
            var barItem = item.getComponent(BarItem)!
            if (!this.isRepeatClick && barItem.getItemIdx() == this._selectIndex) {
                return
            }
            let preItem = this.getBarItemAtIndex(this._selectIndex)
            this._selectIndex = barItem.getItemIdx()
            if (preItem) {
                preItem.onBarItemClick(false)
            }
            barItem.onBarItemClick(true)
            if (this.clickEvents) {
                cc.EventHandler.emitEvents(this.clickEvents, barItem.getItemIdx());
            }
        }, item);

        barItem.onBarItemRender(this._datas[id])
        barItem.onBarItemClick(this._selectIndex == id)

        if (this._selectIndex == id && this.clickEvents) {
            cc.EventHandler.emitEvents(this.clickEvents, barItem.getItemIdx());
        }
        return item
    }


    //重新加载数据
    reloadData(datas : any[], selectedId : number | null = null){
        let len = this.node.children.length
        if (len == 0) {
            return
        }
        if (this._pool == undefined || this._pool == null) {
            this._pool = new cc.NodePool();   
        }
        this._datas = datas;
        this._selectIndex = (selectedId == undefined || selectedId == null) ? -1 : selectedId
        for (let n: number = len - 1; n >= 0; n--) {
            let item = this.node.children[n];
            this._pool.put(item);
        }

        for (let id: number = 0; id < this._datas.length; id++) {
            this.createBarItem(id)
        }       
    }

    //更新Item数据
    updateItemData(idx : number, itemData : any){
        if (this._datas[idx]) {
            this._datas[idx] = itemData
            let item:BarItem = this.getBarItemAtIndex(idx)!
            item.onBarItemRender(this._datas[idx])
        }
    }

    //增加item数据
    addItemData(itemData : any){
        this._datas.push(itemData)
        let id = this._datas.length-1
        this.createBarItem(id)
    }

    //删除item数据
    deleteItemData(idx : number){
        this._datas.splice(idx, 1);
        this.reloadData(this._datas, this._selectIndex)
    }

}
