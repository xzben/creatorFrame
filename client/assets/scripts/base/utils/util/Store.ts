/*
 * @Author: xzben
 * @Date: 2022-05-25 11:43:26
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 14:18:25
 * @Description: file content
 */
import * as cc from "cc"
import { ENV, getCurEnv } from "../../../config/Env";

export class Store{
    private m_name;
    constructor( name : string){
        this.m_name = name;
    }

    private static s_instace : Store = null!;
    public static getInstance() : Store{
        if(this.s_instace == null){
            let name = getCurEnv() == ENV.RELEASE ? "global" : "global" + getCurEnv();
            this.s_instace = new Store(name); 
        }
        return this.s_instace;
    }

    private getKey(key : string) : string{
        return this.m_name + "&" + key;
    }

    public setStringItem(key : string, value : string){
        cc.sys.localStorage.setItem(this.getKey(key), value);
    }

    public setIntValue( key : string, value : number){
        cc.sys.localStorage.setItem(this.getKey(key), Math.floor(value)+"");
    }

    public setFloatValue( key : string, value : number){
        cc.sys.localStorage.setItem(this.getKey(key), value+"");
    }

    public setBoolValue(key : string, value : boolean){
        cc.sys.localStorage.setItem(this.getKey(key), value ? "1" : "0");
    }

    public getStringItem(key: string, defValue : string): string{
        let value = cc.sys.localStorage.getItem(this.getKey(key));

        if(value == null){
            return defValue;
        }

        return value;
    }

    public getIntValue( key : string, defValue : number) : number{
        let value = cc.sys.localStorage.getItem(this.getKey(key));

        if(value == null || value == '' || isNaN(parseInt(value))){
            return defValue;
        }

        return parseInt(value);
    }

    public getFloatValue( key : string, defValue : number) : number{
        let value = cc.sys.localStorage.getItem(this.getKey(key));

        if(value == null || value == '' || isNaN(parseFloat(value))){
            return defValue;
        }

        return parseFloat(value);
    }

    public getBooleanValue( key : string, defValue : boolean) : boolean{
        let value = cc.sys.localStorage.getItem(this.getKey(key));

        if(value == null || value == '' || isNaN(parseInt(value))){
            return defValue;
        }

        return parseInt(value) == 1;
    }

    public removeItem(key: string): void{
        cc.sys.localStorage.removeItem(this.getKey(key));
    }
}