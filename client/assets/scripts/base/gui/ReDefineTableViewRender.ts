import * as cc from 'cc';
import { TableViewCell} from "./TableViewCell"
const { ccclass, property} = cc._decorator;

@ccclass('ReDefineTableViewRender')
export class ReDefineTableViewRender extends cc.Renderable2D {
    private m_tableView : any = null;
    
    onEnable()
    {
        if(this.m_tableView == null) return;
        let shownodes : Map<number, TableViewCell> = this.m_tableView.m_showNodes;
        let freeNodes : TableViewCell [] = this.m_tableView.m_freeNodes;

        if(shownodes)
        {
            shownodes.forEach(( cell : TableViewCell)=>{
                cell.__redefineInit();
            })
        }

        if(freeNodes)
        {
            freeNodes.forEach(( cell : TableViewCell)=>{
                cell.__redefineInit();
            })
        }

    }

    onDisable()
    {
        if(this.m_tableView == null) return;
        let shownodes : Map<number, TableViewCell> = this.m_tableView.m_showNodes;
        let freeNodes : TableViewCell [] = this.m_tableView.m_freeNodes;
        if(shownodes)
        {
            shownodes.forEach(( cell : TableViewCell)=>{
                cell.___redefineReset();
            })
        }

        if(freeNodes)
        {
            freeNodes.forEach(( cell : TableViewCell)=>{
                cell.___redefineReset()
            })
        }

    }

    public setTableView( tableview : any )
    {
        this.m_tableView = tableview;
    }

    public updateAssembler (batcher: any) {
        
    }

    public postUpdateAssembler (batcher: any) {
        let shownodes : Map<number, TableViewCell> = this.m_tableView.m_showNodes;
        if(shownodes == null || shownodes.size <= 0) return;

        let isfinish = false;
        for(let level = 0;; level++)
        {
            if(isfinish) break;
            shownodes.forEach(( cell : TableViewCell)=>{
                if(!cell.__renderUI(level, batcher)){
                    isfinish = true;
                }
            })
        }
    }
}
