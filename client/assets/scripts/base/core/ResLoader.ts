/*
 * @Author: xzben
 * @Date: 2022-05-25 11:40:16
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 14:22:56
 * @Description: file content
 */
import * as cc from "cc"
import { BaseLoader } from "../../../launch/BaseLoader";
import { HttpUtils } from "../utils/util/HttpUtils";
const { ccclass } = cc._decorator;

@ccclass("ResLoader")
export class ResLoader extends BaseLoader{
    //需要使用 bundle 的 version 更新策略则需要使用此接口
    public static loadRemoteBundleVersions( versionFileUrl : string, doneCallback : ()=>void ){
        if(this.m_bundleVersions != null) return doneCallback();

        HttpUtils.httpGet(versionFileUrl, ( txt : string )=>{
            this.m_bundleVersions = new Map();
            let data = txt == "" ? {} : JSON.parse(txt);
            for(let key in data){
                this.m_bundleVersions.set(key, data[key]);
            }
            doneCallback();
        })
    }
}