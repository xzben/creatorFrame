/*
 * @Author: xzben
 * @Date: 2022-05-25 11:41:28
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 11:53:58
 * @Description: file content
 */
import * as cc from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('UrlImageView')
export class UrlImageView extends cc.Component {
    private m_image: cc.Sprite | null = null;

    @property({
        displayName : "url", 
    }) //可以在编辑器中写入地址,也可以使用setUrl
    private m_url: string = "";

    private m_istarted : boolean = false;
    private m_index : number = 0;     //当前尝试次数
    private m_retryNum : number = 3;  //最大重视次数

    public setUrl(url: string) {
        if(this.m_url == url) return;

        this.m_index = 0;
        this.m_url = url;
        
        if(this.m_image)
            this.m_image.spriteFrame = new cc.SpriteFrame();
        if(this.m_istarted)
            this.load();
    }

    private load() {
        if(this.m_url == "") return;

        let loadUrl = this.m_url;
        cc.assetManager.loadRemote(loadUrl, {ext : ".png"},(err : any, imgaeAsset : cc.ImageAsset )=>{
            if(loadUrl != this.m_url) return; //异步过程，可能重新设置过url，所以需要过滤久的设置回调

            if (err) {
                cc.error(err.message || err);
                this.m_index++;
                if(this.m_index < this.m_retryNum){
                    this.load();
                }
            } else {
                if(this.m_image)
                    this.m_image.spriteFrame = cc.SpriteFrame.createWithImage(imgaeAsset);
            }
        });
    }
    
    onLoad(){
        this.m_image = this.getComponent(cc.Sprite);
    }

    start() {
        this.m_istarted = true;
        this.load();
    }
}
