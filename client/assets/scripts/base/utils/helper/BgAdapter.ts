// create by xzben
import * as cc from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('BgAdapter')
export class BgAdapter extends cc.Component {
    
    start () {
        let sp = this.getComponent(cc.Sprite);
        if(sp && sp.spriteFrame){
            let height = sp.spriteFrame.height;
            let width = sp.spriteFrame.width;    
            let framesize = cc.view.getDesignResolutionSize();
            
            let scale = 1;
            if(framesize.width > width || framesize.height > height){
                let sw = framesize.width/width
                let sh = framesize.height/height;
                scale = sw > sh ? sw : sh;
            }
            sp.node.scale = cc.v3(scale, scale, scale);
        }
    }
}