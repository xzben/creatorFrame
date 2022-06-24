import * as cc from 'cc';
import { BaseUI } from '../frame';
const { ccclass, property } = cc._decorator;

@ccclass
export default class BarItem extends BaseUI {
    private m_itemId : number = 0;

    onLoad () {

    }

    getItemIdx(){
        return this.m_itemId
    }

    setItemIdx(itemId : number){
        this.m_itemId = itemId
    }

    onBarItemRender(data : any){
        
    }

    onBarItemClick(isSelect : boolean){

    }

}
