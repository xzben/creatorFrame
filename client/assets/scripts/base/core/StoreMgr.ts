/*
 * @Author: xzben
 * @Date: 2022-05-25 11:40:16
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 11:51:02
 * @Description: file content
 */
import * as cc from "cc"
const {ccclass, property} = cc._decorator;

@ccclass
export class StoreMgr {
    public static s_instance : StoreMgr | null = null;
    public static getInstance(){
        if(this.s_instance == null){
            this.s_instance = new StoreMgr();
            this.s_instance.init()
        }
        return this.s_instance;
    }

    public init(){

    }


	getBoolValue(key : string, def : boolean) : boolean{
		let value = cc.sys.localStorage.getItem(key);
		// log.i("################# getBoolValue",key, value)
		if( value)
		{
			return parseInt(value) == 1;
		}
		else
		{
			return def;
		}
	}

	setBoolValue(key : string, value : boolean){
		cc.sys.localStorage.setItem(key, value ? "1" : "0" );
	}

	getIntValue(key : string, def : number) : number{
		var value = cc.sys.localStorage.getItem(key);
		if(value){
			return parseInt(value);
		}
		else{
			return def;
		}
	}

	setIntValue(key : string, value : number){
		// log.i("################## setIntValue", key, value)
		cc.sys.localStorage.setItem(key, value+"");
	}

	getFloatValue(key : string, def : number) : number{
		var value = cc.sys.localStorage.getItem(key);
		if(value){
			return parseFloat(value);
		}else{
			return def;
		}
	}

	setFloatValue(key : string, value : number){
		cc.sys.localStorage.setItem(key, value+"");
	}
	
	getStringValue(key : string, def : string) : string{
		var value = cc.sys.localStorage.getItem(key);
		if(!value){
			value = def;
		}
		return value;
	}

	setStringValue(key : string, value : string){
		cc.sys.localStorage.setItem(key, value);
	}

	setObjectValue(key : string, obj : Object){
		var stringify = JSON.stringify(obj || {})
        cc.sys.localStorage.setItem(key, stringify)
        // log.i("################## save", key, stringify, obj)
	}
	
	getObjectValue(key : string, def : Object) : Object {
		var userData = cc.sys.localStorage.getItem(key)
		console.log("################## save", userData)
		if (userData == null || userData == undefined 
			|| userData == "" || typeof(userData) != 'string') {
			return def
		}
        var value = JSON.parse(userData)
        // log.i("################## load", key, userData, value)
        return value;
	}
}
