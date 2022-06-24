// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import * as cc from 'cc';
const { ccclass } = cc._decorator;
import { BaseView } from './BaseView';

@ccclass("BaseScene")
export class BaseScene extends BaseView {
    private  = false;
    onLoad(){
        super.onLoad();
    }

    public getSceneType(){
        return 0;
    }
}
