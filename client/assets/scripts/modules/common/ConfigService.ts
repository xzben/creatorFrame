/*
 * @Author: xzben
 * @Date: 2022-05-25 12:04:29
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-07 10:18:43
 * @Description: file content
 */

import * as cc from 'cc';
import { ResLoader, ServiceMgr } from '../../base/core';
import { BaseService } from '../../base/frame';
const { ccclass, property } = cc._decorator;

export enum CONFIG_PATH {
    // HERO_INFO = "common#config/hero_infos_config.json",
}

type DoneCall = ( success : boolean, value : any)=>void;

@ccclass('ConfigService')
export class ConfigService extends BaseService {
    private m_resloader : ResLoader = new ResLoader();
    private m_loadedValue : Map<string, any> = new Map();

    public static getInstance() : ConfigService{
        return ServiceMgr.getService("ConfigService", ConfigService);
    }
    
    public loadAllConfigs( doneCallback : ()=>void, process : ( percent : number )=>void = null!){
        let count = 0;
        let paths : string[] = [];

        for( let key in CONFIG_PATH){
            let path = (CONFIG_PATH as any)[key];
            count++;
            paths.push(path);
        }

        if(count <= 0){
            return doneCallback();
        }

        let loadCount = 0;
        for(let i = 0; i < count; i++){
            this.getConfigValue(paths[i], ()=>{
                loadCount ++;
                process && process(loadCount/count);
                
                if(loadCount >= count){
                    doneCallback();
                }
            })
        }
    }

    private getConfigValue( path : string, doneCall : DoneCall){
        let data = this.m_loadedValue.get(path);
        if(data == null){
            this.m_resloader.LoadJsonAsset(path, (err : Error | null, data : cc.JsonAsset)=>{
                if(data ){
                    this.m_loadedValue.set(path, data.json);
                    doneCall(true, data.json);
                }else{
                    doneCall(false, null);
                }
            })
        }else{
            doneCall(true, data);
        }
    }

    private getConfigKeyValue( id : number | string, path : string, doneCall : DoneCall){
        this.getConfigValue(path, ( success : boolean, data : any)=>{
            if(success){
                let config = data[""+id];
                if(config == null){
                    doneCall(false, null);
                }else{
                    doneCall(true, config);
                }
            }else{
                doneCall(false, null);
            }
        })
    }
}