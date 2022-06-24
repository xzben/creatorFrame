
import * as cc from 'cc';
import { utils } from '../utils/utils';
const { ccclass } = cc._decorator;

type className<T> = new()=>T;

export enum AOPType{
    BEFORE,
    REPLACE,
    AFTER,
    BETWEEN,
}

class AopContainer{
    private m_target : any;
    private m_field : string;
    private m_origin : Function;

    private m_beforeMap : Map<string, Function> = new Map();
    private m_afterMap : Map<string, Function> = new Map();
    private m_replaceMap : Map<string, Function> = new Map();
    private m_betweenMap : Map<string, Function> = new Map();

    public insertAspect(type : AOPType, key : string, func : Function){
        switch(type){
            case AOPType.BEFORE:
                {
                    this.m_beforeMap.set(key, func);
                    break;
                }
            case AOPType.AFTER:
                {
                    this.m_afterMap.set(key, func);
                    break;
                }
            case AOPType.REPLACE:
                {
                    this.m_replaceMap.set(key, func)
                    break;
                }
            case AOPType.BETWEEN:
                {
                    this.m_betweenMap.set(key, func);
                }
        }
    }

    public clear(){
        this.m_target.prototype[this.m_field] = this.m_origin;
    }

    public remoevAspect( type : AOPType, key : string){
        switch(type){
            case AOPType.BEFORE:
                {
                    this.m_beforeMap.delete(key);
                    break;
                }
            case AOPType.AFTER:
                {
                    this.m_afterMap.delete(key);
                    break;
                }
            case AOPType.REPLACE:
                {
                    this.m_replaceMap.delete(key);
                    break;
                }
        }
    }

    private doAspect( funcs : Map<string, Function>, self : any, ...param : any) : boolean{
        if(funcs.size <= 0) return false;

        funcs.forEach(( func)=>{
            func.call(self, self, ...param);
        })

        return true;
    }

    private doBetweenAspect( self : any, callcount : number, calldata : any, ...params : any){
        return this.doAspect(this.m_betweenMap, self, callcount, calldata, ...params);
    }

    private doBeforeAspect(self : any, ...params : any) : boolean {
       return this.doAspect(this.m_beforeMap, self, ...params);
    }

    private doAfterAspect(self : any, ...params : any) : boolean{
        return this.doAspect(this.m_afterMap, self, ...params);
    }

    private doReplaceAspect( self : any, ...params : any) : boolean{
       return this.doAspect(this.m_replaceMap, self, ...params);
    }

    constructor(target : any, field : string){
        this.m_target = target;
        this.m_field = field;
        
        let obj = this;
        this.m_origin = this.m_target.prototype[field];

        this.m_target.prototype[field] = function(){
            let betweenData = {}
            obj.doBetweenAspect(this, 0, betweenData, ...arguments);
            obj.doBeforeAspect(this, ...arguments);

            if(!obj.doReplaceAspect(this, arguments)){
                obj.m_origin.call(this, ...arguments);
            }
            obj.doAfterAspect(this, ...arguments);
            obj.doBetweenAspect(this, 1, betweenData, ...arguments);
        }
    }
}

@ccclass('AOPManager')
export class AOPManager{
    public static s_instance : AOPManager | null = null;
    public static getInstance(){
        if(this.s_instance == null){
            this.s_instance = new AOPManager();
            this.s_instance.init()
        }
        
        return this.s_instance;
    }

    private m_containors : Map<number, Map<string, AopContainer>> = new Map();

    protected init(){

    }

    private getContainor<T>( className : new()=>T, field : string, autoCreate : boolean = false) : AopContainer | undefined{
        let id = utils.getObjectUniquedId(className);

        let containors = this.m_containors.get(id)
        if(containors == null ){
            if(autoCreate){
                containors = new Map();
                this.m_containors.set(id, containors);
            }else{
                return undefined;
            }
        }

        let con = containors.get(field);
        if(con == null && autoCreate){
            con = new AopContainer(className, field);
            containors.set(field, con);
        }

        return con;
    }

    private addAspect<T>( className : new()=>T, type : AOPType, field : string, key : string, func : Function) : boolean{
        let con  = this.getContainor(className, field, true); 
        if(con){
            con.insertAspect(type, key, func);
            return true;
        }

        return false;
    }

    public removeAspect<T>( className : new()=>T, type : AOPType, field : string, key : string) : boolean{
        let con = this.getContainor(className, field);
        if(con){
            con.remoevAspect(type, key);
            return true;
        }

        return false;
    }

    public before<T>( className : new()=>T, field : string, key : string, func : Function ) : boolean {
       return this.addAspect(className, AOPType.BEFORE, field, key, func);
    }

    public after<T>( className : new()=>T, field : string, key : string, func : Function ) : boolean {
        return this.addAspect(className, AOPType.AFTER, field, key, func);
    }

    public replace<T>( className : new()=>T, field : string, key : string, func : Function ) : boolean {
        return this.addAspect(className, AOPType.REPLACE, field, key, func);
    }

    public between<T>( className : new()=>T, field : string, key : string, func : Function ) : boolean {
        return this.addAspect(className, AOPType.BETWEEN, field, key, func);
    }
}