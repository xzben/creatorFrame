
import  * as cc from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('MergeMesh')
export class MergeMesh extends cc.Component {

    @property(cc.Node)
    private m_source : cc.Node = null!;

    @property(cc.Node)
    private m_dest : cc.Node = null!;
    start () {
        cc.BatchingUtility.batchStaticModel(this.m_source, this.m_dest);
    }
}