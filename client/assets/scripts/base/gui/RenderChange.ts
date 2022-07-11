/*
 * @Author: xzben
 * @Date: 2022-06-06 18:23:55
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-06 18:25:24
 * @Description: file content
 */
import * as cc from 'cc';
const { ccclass, property } = cc._decorator;

interface IDelayRender{
    _renderFlag : boolean;
    _realRenderFunc(batcher: any);
}

@ccclass('RenderChange')
export class RenderChange extends cc.Renderable2D {
    private m_renderlist : Array<string> = new Array();
    private m_renderGroup : Map<string, Array<IDelayRender>> = new Map();

    on
    onDisable()
    {
        let renders = this.node.getComponentsInChildren(cc.Renderable2D);
        renders.forEach(( render : cc.Renderable2D)=>{
            let rendertemp = render as any;
            if(rendertemp._realRenderFunc != null)
            {
                rendertemp._render = rendertemp._realRenderFunc
                rendertemp._realRenderFunc = null!;
            }
        });
    }

    private renderChild(node : cc.Node, prename : string)
    {
        if(!node.activeInHierarchy)return;

        let curname = `${prename}$${node.name}`;
        let render = node.getComponent(cc.Renderable2D);
        if(render)
        {
            let arr = this.m_renderGroup.get(curname);
            let isnewarr = false;
            if(arr == null)
            {
                isnewarr = true;
                arr = new Array();
                this.m_renderlist.push(curname)
                this.m_renderGroup.set(curname, arr);
            }

            let rendertemp = render as any;
            if(rendertemp._realRenderFunc == null)
            {
                rendertemp._realRenderFunc = rendertemp._render;
                rendertemp._render = function(){}
            }
 
            arr.push(rendertemp);
            node.children.forEach(( ch : cc.Node )=>{
                this.renderChild(ch, curname);
            })
        }
        else
        {
            node.children.forEach(( ch : cc.Node )=>{
                this.renderChild(ch, curname);
            })
        }

    }

    public updateAssembler (batcher: any) {
        this.m_renderlist.length = 0;
        this.m_renderGroup.clear();

        this.node.children.forEach(( ch : cc.Node )=>{
            this.renderChild(ch, "");
        })
    }

    public postUpdateAssembler (batcher: any) {
        this.m_renderlist.forEach(( name : string)=>{
            let arr = this.m_renderGroup.get(name);
            if(arr)
            {
                arr.forEach(( idrender : IDelayRender)=>{
                    if(idrender._renderFlag)
                        idrender._realRenderFunc(batcher);
                })
            }
        })
    }
}