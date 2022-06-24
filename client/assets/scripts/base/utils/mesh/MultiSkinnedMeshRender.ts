import * as cc from "cc"
import { updateMeshTextureIdx } from "./MultiTexure";
const { ccclass, property, executeInEditMode} = cc._decorator;

@ccclass("MultiSkinnedMeshRender")
@executeInEditMode
export class MultiSkinnedMeshRender extends cc.SkinnedMeshRenderer{
    @property(cc.CCInteger)
    private m_textureIdx : number = 0;
    
    protected _onMeshChanged (old: cc.Mesh | null) {
        updateMeshTextureIdx(this.mesh, this.m_textureIdx);
    }

    public onLoad(){
        if (this.mesh) { 
            updateMeshTextureIdx(this.mesh, this.m_textureIdx);
        }
        this._updateModels();
        this._updateCastShadow();
        this._updateReceiveShadow();
    }
}