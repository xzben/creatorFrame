/*
 * @Author: xzben
 * @Date: 2022-05-25 11:41:28
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 11:53:49
 * @Description: file content
 */
import * as cc from 'cc';
import { BaseUI } from '../frame';
const { ccclass, property } = cc._decorator;

@ccclass('TableViewCell')
export class TableViewCell extends BaseUI {
    protected m_index : number = -1;
    protected m_data : any = null;
    protected m_tree : any = null;

    getCellIndex(){
        return this.m_index;
    }

    setCellIndex(index:number){
        this.m_index = index;
    }

    setTree( tree : any){
        this.m_tree = tree;
    }

    getCellData() : any{
        return this.m_data;
    }
    
    setData( idx : number, cellData : any, extendData : any){
        this.m_index = idx;
        this.m_data = cellData;
        this.updateData(idx, cellData, extendData);
    }


    protected doClickCellItem(){
        this.m_tree.doClickCellItem(this.m_index);
    }

    public updateData( idx : number, cellData : any, extendData : any){
        
    }

    public getCellSize( idx : number, cellData : any) : cc.Size {
        let uitransform = this.node.getComponent(cc.UITransform);
        if(uitransform){
            return uitransform.contentSize;
        }

        return cc.size(0, 0);
    }
}
