import * as cc from 'cc';
import { TableView, DirectType } from './TableView';
const { ccclass, property } = cc._decorator;

@ccclass('GridView')
export class GridView extends TableView {
    @property({
        displayName : "autoCount",
        tooltip : "是否自动计算数量",
    })
    protected m_autoCount : boolean = true;
    
    @property({
        type : cc.CCInteger,
        displayName : "fixedCount",
        tooltip : "垂直滑动代表水平方向的数量，水平滑动则代表垂直方向数量",
        visible(){
            let obj : any = this;
            return !obj.m_autoCount;
        },
    })
    protected m_fixedCount : number = 0;

    @property({
        type : cc.CCInteger,
        displayName : "",
        tooltip : "网格cell之间的gap",
    })
    protected m_gap : number = 0;

    protected onLoad(){
        super.onLoad();
        this.initFixedCount();
    }

    protected handleResize(){
        console.log("handleResize")
        this.initFixedCount();
        this.reloadData(true);
    }

    protected initFixedCount()
    {
        if(!this.m_autoCount)return;
        let size = this.getViewSize();
        let cellSize = this.cellSizeForTable(0);

        if(this.m_director == DirectType.HORIZONTAL)
        {
            this.m_fixedCount = Math.floor((size.height+this.m_gap)/(cellSize.height + this.m_gap));
        }
        else
        {
            this.m_fixedCount = Math.floor((size.width+this.m_gap)/(cellSize.width + this.m_gap));
        }
    }

    protected getItemPos( idx : number ) : cc.Vec3{
        let x = 0, y = 0;
        let viewSize = this.getViewSize();
        if(this.m_director == DirectType.HORIZONTAL){
            x = this.m_vCellPositions[idx];
            let col = idx%this.m_fixedCount;
            let cellHeight = viewSize.height/this.m_fixedCount;
            y = viewSize.height/2 - (col*cellHeight + cellHeight/2);
        }else{
            y = -1*this.m_vCellPositions[idx];
            let row = idx%this.m_fixedCount;
            let cellWidth = viewSize.width/this.m_fixedCount;
            x = row*cellWidth + cellWidth/2 - viewSize.width/2;
        }

        return cc.v3(x, y, 0);
    }

    protected _indexFromOffset( offset : number, isStart : boolean ){
        let maxIdx = this.getCellCount() - 1;
        let tempIndex = this.__indexFromOffset(offset, isStart);

        let index = tempIndex;
        if( isStart)
            index = Math.floor(tempIndex/this.m_fixedCount)*this.m_fixedCount;
        else
            index = (Math.ceil(tempIndex/this.m_fixedCount)+1)*this.m_fixedCount - 1;
            
        index = Math.max(0, index);
        index = Math.min(index, maxIdx);

        return index;
    }

    protected updateCellPositions(){
        let cellCount = this.getCellCount();
        let curPos = this.m_headEndGap;
        let cellSize = this.cellSizeForTable(0);

        let row = Math.ceil(cellCount/this.m_fixedCount);
        let col = this.m_fixedCount;

        for(let i = 0; i < row; i++)
        {
            for(let j = 0; j < col; j++)
            {
                let idx = i*this.m_fixedCount + j;
                this.m_vCellPositions[idx] = curPos;
            }

            if(this.getDirection() == DirectType.HORIZONTAL){
                curPos += cellSize.width;
            }else{
                curPos += cellSize.height;
            }

            if(i < row - 1){
                curPos += this.m_spaceing;
            }
        }
        this.m_vCellPositions[cellCount] = curPos;
    }
}
