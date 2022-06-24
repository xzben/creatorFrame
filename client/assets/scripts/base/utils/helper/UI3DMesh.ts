
import * as cc from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('UI3DMesh')
export class UI3DMesh extends cc.Component {
    onLoad(){
        this.addUIMesh(this.node);
    }

    public changeShow3DNode( node : cc.Node){
        this.node.removeAllChildren();
        this.node.addChild(node);
        this.addUIMesh(node);
    }
    
    private addUIMesh( node : cc.Node){
        if(node.getComponent(cc.MeshRenderer) != null && node.getComponent(cc.UIMeshRenderer) == null){
            node.addComponent(cc.UIMeshRenderer);
        }

        node.children.forEach(( node : cc.Node)=>{
            this.addUIMesh(node);
        })
    }
}