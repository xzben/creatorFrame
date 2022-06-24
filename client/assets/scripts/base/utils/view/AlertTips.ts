import * as cc from 'cc';
import { BaseView } from '../../frame/BaseView';
const { ccclass, property } = cc._decorator;

@ccclass("AlertTips")
export class AlertTips extends BaseView{
    @property(cc.Label)
    private m_label : cc.Label | null = null;

    setText( text : string ){
        if(this.m_label)
            this.m_label.string = text;
    }

    public onUpdateData( params : any){
        this.setText(params.tips);
    }

    protected checkAddBlockNode(){} //置空添加屏蔽

    onLoad(){
        super.onLoad();
        let bg = this.node.getComponent(cc.Sprite);
        if(bg)
        {
            bg.color = cc.color(255,255,255,255)
            cc.tween(this.node)
                .delay(0.4)
                .by(0.6, { position : cc.v3(0,220,0)})
                .delay(1)
                .by(0.3, { position : cc.v3(0,200,0)})
                .removeSelf()
                .start();
        }
    }
}