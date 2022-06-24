import * as cc from "cc"
import { BaseView } from "../../frame/BaseView";
const { ccclass, property } = cc._decorator;

@ccclass("LoadingView")
export class LoadingView extends BaseView{
    @property(cc.Label)
    private m_tips : cc.Label | null = null;

    @property(cc.Node)
    private m_tipsBg : cc.Node | null = null;

    onUpdateData( params : any){
        this.setTxtLoading(params.tips);
    }
    
    onLoad() {
        super.onLoad();
    }

	setTxtLoading(msg : string){
        if(this.m_tipsBg)
            this.m_tipsBg.active = false;
        
        if(this.m_tips)
		    this.m_tips.string = msg;
	}
}
