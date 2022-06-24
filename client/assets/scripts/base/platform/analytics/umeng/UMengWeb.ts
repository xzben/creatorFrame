
import * as cc from "cc"
import { log } from "../../../log/log";
import { UMengH5 } from "./UMengH5";
const {ccclass, property} = cc._decorator;

export type ListenerFunc = (...param : any)=>void;

let tempWind : any = window;

//这个用于web浏览器上测试使用
@ccclass('UMengWeb')
export class UMengWeb extends UMengH5{

    public init(){
        log.d("############# UMengWeb:init()")
        this.loadSdk(window, document, 'script', 'aplus_queue', '203467608')
       //集成应用的appKey
        tempWind.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['appKey', '6166820b14e22b6a4f1f2911']
        });

        tempWind.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['aplus-waiting', '1000']
        });
        //是否开启调试模式 
        tempWind.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['DEBUG', true]
        });
    }

    private loadSdk(w:any, d:any, s:string, q:string, i:string){
        w[q] = w[q] || [];
        var path = 'https://d.alicdn.com/alilog/mlog/aplus/' + i + '.js';
        console.log("createElement 203467608.js")
        var f = d.getElementsByTagName(s)[0],j = d.createElement(s);
        j.async = true;
        j.id = 'beacon-aplus';
        j.src = path;
        console.log("===2123121=======", j.src)
        f.parentNode.insertBefore(j, f);
    }

    public customEvent(eventId : string, eventData : any){
        let datas : any = {}
        if (eventData) {
            for (let key in eventData) {
                datas[key] = eventData[key] + "";
            }
        }
        let stringify = JSON.stringify(datas);
        log.d("==UMengWeb:customEvent===event:", eventId, " eventData:"+stringify);
        
        tempWind.aplus_queue.push({
            action: 'aplus.record',
            arguments: [eventId, 'CLK', datas]
        });
    }
 
}
