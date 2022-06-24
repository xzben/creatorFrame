/*
 * @Author: xzben
 * @Date: 2022-05-25 11:41:28
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 11:53:53
 * @Description: file content
 */
import * as cc from 'cc';
import { BaseUI } from '../frame';
import { utils } from '../utils/utils';
const { ccclass, property, requireComponent } = cc._decorator;

@ccclass('ToggleView')
@requireComponent(cc.Sprite)
export class ToggleView extends BaseUI {
    private toggleSprite : cc.Sprite = null!;
    @property(cc.SpriteFrame)
    private m_open : cc.SpriteFrame = null!;

    @property(cc.SpriteFrame)
    private m_close : cc.SpriteFrame = null!;

    private _isChecked: boolean = false;
    @property({type: cc.CCBoolean})
    public get isChecked () {
        return this._isChecked;
    }
    public set isChecked (value : boolean) {
        this._isChecked = value;
        if (!this.toggleSprite)this.toggleSprite = this.getComponent(cc.Sprite)!
        if (value) {
            if (this.m_open) this.toggleSprite.spriteFrame = this.m_open
        }else{
            if (this.m_close) this.toggleSprite.spriteFrame = this.m_close
        }
    }

    //点击事件
    @property({
        type: cc.EventHandler,
        tooltip: '点击事件',
    })
    public checkEvents: cc.EventHandler[] = [];


    onLoad(){
        this.toggleSprite = this.getComponent(cc.Sprite)!
        utils.addClickCallbackFunc(this.node, this, "handleToggle")
    }

    setChecked( value : boolean ){
        this._isChecked = value;
        if (!this.toggleSprite)this.toggleSprite = this.getComponent(cc.Sprite)!
        if (value) {
            if (this.m_open) this.toggleSprite.spriteFrame = this.m_open
        }else{
            if (this.m_close) this.toggleSprite.spriteFrame = this.m_close
        }
    }

    handleToggle() {
        this.isChecked = !this.isChecked;
        if (this.checkEvents) {
            cc.EventHandler.emitEvents(this.checkEvents, this.isChecked);
        }
    }

}