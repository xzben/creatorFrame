import * as cc from 'cc';
import { TableViewCell} from "./TableViewCell"
import { utils } from "../utils/utils"
import { RenderChange } from './RenderChange';

const { ccclass, property, requireComponent} = cc._decorator;

export enum DirectType{
    VERTICAL = 0,    //垂直
    HORIZONTAL = 1,  //水平
}

type InitCallback = ()=>void;
type ClickCallback = (index : number, cellData : any)=>void;

@ccclass('TableView')
@requireComponent(cc.ScrollView)
@requireComponent(cc.UITransform)
export class TableView extends cc.Component {
    @property({
        type : cc.Enum(DirectType),
        displayName : "direct",
    })
    protected m_director : DirectType = DirectType.VERTICAL;
    
    @property({
        displayName : "item",
        tooltip: "列表中的item",
        type : cc.Prefab,
    })
    protected m_item : cc.Prefab | null = null;

    @property({
        displayName : "space",
        tooltip: "item之间的间隔",
    })
    protected m_spaceing : number = 0;


    @property({
        displayName : "headEndGap",
        tooltip: "列表头部和尾部的间隙",
    })
    protected m_headEndGap : number = 0;

    @property({
        displayName : "redefineRender",
        tooltip: "是否使用重定义Render实现DrawCall优化",
    })
    protected m_redefineRender : boolean = true;

    protected m_data : any[] = [];
    protected m_extendData : any = null;

    protected m_showNodes : Map<number, TableViewCell> = new Map;
    protected m_freeNodes : TableViewCell [] = [];
    protected m_vCellPositions : number[] = [];

    protected m_templateCell : cc.Node | null = null;

    protected m_scrollView : cc.ScrollView | null = null;

    protected m_uitranform : cc.UITransform | null = null;

    protected m_content : cc.Node | null = null;

    protected m_contentUITransform : cc.UITransform | null = null;

    protected m_preScrollOffset : number | null = null;

    protected m_cellClickCallback : ClickCallback = null!;

    protected m_scrollEanble = true;

    protected onLoad(){
        this.initControl();
        console.log("tableview start")
        this.node.on(cc.Node.EventType.SIZE_CHANGED, ()=>{
            console.log("tableview resize")
            let offset = this.m_preScrollOffset;
            if(offset == null)
                offset = 0;
            this.setContainerOffset(offset);
            this.m_preScrollOffset = null;
            this.handleResize();
        })
    }

    public setScrollEnable( enable : boolean){
        this.m_scrollView!.horizontal = enable;   
        this.m_scrollView!.vertical = enable;   
    
    }

    protected handleResize(){
        this.reloadData(true);
    }

    public  setClickCallback( callback : ClickCallback ){
        this.m_cellClickCallback = callback;
    }

    public setViewSize(  size : cc.Size){
        let uitranform = this.getComponent(cc.UITransform);

        let scrollView = this.getComponent(cc.ScrollView);

        if(scrollView){
            scrollView.view!.width = size.width;
            scrollView.view!.height = size.height;
        }

        if(uitranform){
            uitranform.width = size.width;
            uitranform.height = size.height;
        }
    }

    public setScrollEanble( enable : boolean){
        this.m_scrollEanble = enable;
        let scrollView = this.getComponent(cc.ScrollView);
        scrollView!.vertical = this.m_scrollEanble && this.m_director == DirectType.VERTICAL;
        scrollView!.horizontal = this.m_scrollEanble && this.m_director == DirectType.HORIZONTAL;
    }

    public   doClickCellItem( index : number )
    {
        let cellData = this.m_data[index];
        
        this.handleClickCellitem(index, cellData);

        if(this.m_cellClickCallback != null ){
            this.m_cellClickCallback(index, cellData);
        }
    }

    protected handleClickCellitem( index : number, cellData : any){

    }

    protected initControl(){
        this.m_scrollView = this.getComponent(cc.ScrollView);
        this.m_uitranform = this.getComponent(cc.UITransform);

        if(this.m_scrollView)
        {
            this.m_content = this.m_scrollView.content;
            if(this.m_content)
            {
                this.m_contentUITransform = this.m_content.getComponent(cc.UITransform);
                this.m_content.walk = (... param : any [])=>{
                    console.log("content walk", param)
                }
                if(!this.m_content.getComponent(RenderChange))
                    this.m_content.addComponent(RenderChange);
            }

            let eventHandler = new cc.EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = "TableView";
            eventHandler.handler = "scrollViewDidScroll";
            this.m_scrollView.scrollEvents.push(eventHandler);

            this.m_scrollView.vertical = this.m_scrollEanble && this.m_director == DirectType.VERTICAL;
            this.m_scrollView.horizontal = this.m_scrollEanble && this.m_director == DirectType.HORIZONTAL;
        }

        if(this.m_contentUITransform)
        {
            let viewSize = this.getViewSize();
            if(this.m_director == DirectType.HORIZONTAL){
                this.m_contentUITransform.setAnchorPoint(0, 0.5);
                this.m_content?.setPosition(cc.v3(-1*viewSize.width/2, 0, 0));
            }
            else{
                this.m_contentUITransform.setAnchorPoint(0.5, 1);
                this.m_content?.setPosition(cc.v3(0, viewSize.height/2, 0));
            }
            this.m_contentUITransform.contentSize = viewSize;
        }
    }

    public setData( data : any){
        this.m_data = data;
    }

    public setExtendData( data : any){
        this.m_extendData = data;
    }

    public getExtendData( ){
        return this.m_extendData;
    }

    public getShowNodes(){
        return this.m_showNodes;
    }

    protected cellSizeForTable( idx : number ) : cc.Size {
        if(this.m_item == null)
            return cc.size(0, 0);

        if(this.m_templateCell == null )
        {
            this.m_templateCell = cc.instantiate(this.m_item);
            this.m_templateCell.active = false;
            this.m_content?.addChild(this.m_templateCell);
        }
        
        return utils.getNodeSize(this.m_templateCell)
    }

    protected updateCellPositions(){
        let cellCount = this.getCellCount();
        let curPos = this.m_headEndGap;
        let cellSize = this.cellSizeForTable(0);

        for(let i = 0; i < cellCount; i++){
            this.m_vCellPositions[i] = curPos;
            if(this.getDirection() == DirectType.HORIZONTAL){
                curPos += cellSize.width;
            }else{
                curPos += cellSize.height;
            }
            if(i < cellCount-1)
                curPos += this.m_spaceing;
        }
        this.m_vCellPositions[cellCount] = curPos;
    }

    public getViewSize() : cc.Size {
        if(this.m_uitranform)
            return this.m_uitranform.contentSize;

        return cc.size(0, 0);
    }

    protected updateContentSize(){
        if(this.m_contentUITransform == null) return;

        let size = this.getViewSize();
        let cellCount = this.getCellCount();
        if(cellCount > 0){
            let maxPos = this.m_vCellPositions[cellCount];
            if(this.getDirection() == DirectType.HORIZONTAL){
                maxPos = Math.max(size.width, maxPos) + this.m_headEndGap;
                size = cc.size(maxPos, size.height);
            }else{
                maxPos = Math.max(size.height, maxPos) + this.m_headEndGap;
                size = cc.size(size.width, maxPos);
            }
        }
        
        this.m_contentUITransform.contentSize = size;
    }

    protected setContainerOffset( offset : number){
        if(this.m_content == null) return;
        let viewSzie = this.getViewSize();
        if(this.m_director == DirectType.HORIZONTAL){
            utils.setPositionX(this.m_content, offset - viewSzie.width/2);
        }else{
            utils.setPositionY(this.m_content, offset + viewSzie.height/2);
        }
    }

    protected __indexFromOffset(offset : number, isStart : boolean)
    {
        var low = 0
        var search = offset
        var high = this.getCellCount() - 1

        while (high >= low) {
            var index = low + Math.floor((high - low) / 2)
            var cellStart = this.m_vCellPositions[index]
            var cellEnd = this.m_vCellPositions[index + 1]
            if (search >= cellStart && search <= cellEnd){
                low = index
                break
            }
            else if (search < cellStart){
                high = index - 1
            }
            else{
                low = index + 1
            }
        }

        var count = this.getCellCount() - 1
        if (low <= 0) {
            return 0
        }else if(low >= count){
            return count
        }
        return low
    }

    protected _indexFromOffset( offset : number, isStart : boolean ){
        let maxIdx = this.getCellCount() - 1;
        let index = this.__indexFromOffset(offset, isStart);

        index = Math.max(0, index);
        index = Math.min(index, maxIdx);

        return index;
    }

    public scrollTo( index : number, dt ?: number){
        if(this.m_scrollView){
            let pos = this.getItemPos(index);
            this.m_scrollView.scrollToOffset(cc.v2(pos.x, -1*pos.y), dt);
        }
    }

    protected updateScrollViewContent( forceUpdate : boolean){

        // console.time("xxxxxxxxxxxxxxx");
        let offset = this.getContainerOffset();
        // if(this.m_preScrollOffset != null && this.m_preScrollOffset == offset) return;
        if(!forceUpdate && this.m_preScrollOffset != null && Math.floor(this.m_preScrollOffset) == Math.floor(offset)) return;
        this.m_preScrollOffset = offset;

        let cellCount = this.getCellCount();
        if(cellCount <= 0) return;

        let startIdx = 0, endIdx = 0, maxIdx = 0
        let viewSize = this.getViewSize();
        
        maxIdx = Math.max(cellCount - 1, 0);

        startIdx = this._indexFromOffset(offset, true);
        if(this.m_director == DirectType.HORIZONTAL){
            offset = offset + viewSize.width;
        }else{
            offset = offset + viewSize.height;
        }

        endIdx = this._indexFromOffset(offset, false);
        // console.log("tableview scrollViewDidScroll", this.m_director, offset, viewSize, startIdx, endIdx);
        this.m_showNodes.forEach(( cell : TableViewCell)=>{
            let cellIdx = cell.getCellIndex();
            if( cellIdx < 0 || cellIdx < startIdx  || cellIdx > endIdx ){
                this.freeCell( cell);
                this.m_showNodes.delete(cellIdx);
            }
        })

        for(let i = startIdx; i <= endIdx; i++){
            if(i < 0 || i > cellCount){
                continue;
            }
            this.updateCellAtIndex(i);
        }
        // console.timeEnd("xxxxxxxxxxxxxxx");
    }
    protected scrollViewDidScroll(){
       this.updateScrollViewContent(false);
    }

    protected freeCell( cell : TableViewCell ){
        cell.node.active = false;
        this.m_freeNodes.push(cell);
    }

    protected getDequeueCell(): TableViewCell | undefined {
        let cell = this.m_freeNodes.pop();
        if(cell != null)
        {
            return cell;
        } 

        if(this.m_item)
        {
            let newNode = cc.instantiate(this.m_item);
            // let anchorPoint = cc.v2(0.5, 1);
            // if(this.m_director == DirectType.HORIZONTAL){
            //     anchorPoint = cc.v2(0, 0.5);
            // }else{
            //     anchorPoint = cc.v2(0.5, 1);
            // }
            // utils.setNodeAnchorPoint(newNode, anchorPoint);
            this.m_content?.addChild(newNode);
            let cell = newNode.getComponent(TableViewCell)
            if(cell == null){
                cell = newNode.addComponent(TableViewCell);
            }
            cell.setTree(this);
            console.log("======getDequeueCell new======")
            return cell;
        }
    }

    protected getItemPos( idx : number ) : cc.Vec3{
        let x = 0, y = 0;
        if(this.m_director == DirectType.HORIZONTAL){
            x = this.m_vCellPositions[idx];
        }else{
            y = -1*this.m_vCellPositions[idx];
        }
        return cc.v3(x, y, 0);
    }

    protected setCellPos( node : cc.Node, pos : cc.Vec3)
    {
        let uitranform = node.getComponent(cc.UITransform)!;
        if(uitranform)
        {
            if(this.m_director == DirectType.HORIZONTAL)
            {
                pos.x += uitranform.anchorX*uitranform.width;
            }
            else
            {
                pos.y -= uitranform.anchorY*uitranform.height;
            }
        }
        node.position = pos;
    }

    protected updateCellAtIndex( idx : number){
        let cellData = this.m_data[idx];
        let cell : TableViewCell | undefined = this.m_showNodes.get(idx);
        if( cell == null ){
            cell = this.getDequeueCell();
            cell!.node.active = true;
            cell!.setData(idx, cellData, this.m_extendData);
            this.setCellPos(cell.node, this.getItemPos(idx));
            this.m_showNodes.set(idx, cell!);
        }else{
            this.setCellPos(cell.node, this.getItemPos(idx));
        }
    }

    public reloadData( keep : boolean = false, forceUpdate : boolean = false){
        let cellsCount = this.getCellCount();
        this.m_showNodes.forEach(( cell : TableViewCell )=>{
            this.freeCell(cell);
        })
        this.m_showNodes.clear();

        this.updateCellPositions();
        this.updateContentSize();

        if(!keep){
            this.setContainerOffset(0);
        }

        if(cellsCount > 0){
            this.updateScrollViewContent(forceUpdate);
        }
    }

    public getData() : any {
        return this.m_data;
    }

    public getCellCount() : number{
        return this.m_data.length;
    }
    
    protected getDirection() : DirectType {
        return this.m_director;
    }

    protected getContainerOffset() : number {
        if(this.m_scrollView == null) return 0;
        let content = this.m_scrollView.content;
        if(content == null) return 0;
        let parentNode = content.parent;
        if(parentNode == null) return 0;

        let viewSize = this.getViewSize();
        if(this.m_director == DirectType.HORIZONTAL){
            return (content.position.x + viewSize.width/2)*-1;        
        }else{
            return content.position.y - viewSize.height/2;
        }
    }

    protected getContainerSize() : cc.Size{
        if(this.m_scrollView)
        {
            let content = this.m_scrollView.content;
            if(content){
                let transform = content.getComponent(cc.UITransform);
                if(transform){
                    return transform.contentSize;
                }
            }
        }
        
        return cc.size(0, 0);
    }

    //更新Item数据
    public updateItemData(idx : number, cellData : any){
        if (this.m_data[idx]) {
            this.m_data[idx] = cellData;
            let cell : TableViewCell | undefined = this.m_showNodes.get(idx);
            if( cell ){
                cell!.setData(idx, this.m_data[idx], this.m_extendData);
            }
        }
    }
}
