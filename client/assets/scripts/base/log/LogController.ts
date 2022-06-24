/*
 * @Author: xzben
 * @Date: 2022-05-25 11:42:02
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 11:55:39
 * @Description: file content
 */
import * as cc from "cc"
import { getCurEnv } from "../../config/Env";
import { LogBattle } from "./LogBattle";
import { LogConsole } from "./LogConsole";
import { LogDelegate } from "./LogDelegate";
import { LogLevel } from "./LogLevel";

const {ccclass, property} = cc._decorator;

@ccclass
export class LogController {
    public static s_instance : LogController | null = null;
    public static getInstance(){
        if(this.s_instance == null){
            this.s_instance = new LogController();
            this.s_instance.init()
        }
        return this.s_instance;
    }

    private m_level : LogLevel = LogLevel.INFO;
    private m_delegates : LogDelegate[] = [];
    private m_battleLog : LogDelegate = null!;

    constructor(){
        
    }

    init(){
        this.addDelegate(new LogConsole());
        this.m_level = LogLevel.INFO;
        let curEnv = getCurEnv();
        let enableLog = true;

        // if(curEnv == ENV.RELEASE){
        //     enableLog = false;
        // }else if(curEnv == ENV.OUT_TEST && !cc.sys.isBrowser){
        //     enableLog = false;
        // }
        
        if(!enableLog){
            this.m_level = LogLevel.WARN;
            console.log = ( ... params: any )=>{  }
            console.info = ( ... params: any )=>{  }
            console.debug = ( ... params: any )=>{  }
            console.error = ( ... params: any )=>{ this.handleLog(LogLevel.ERROR, params); }
            console.warn = ( ... params: any )=>{ this.handleLog(LogLevel.WARN, params); }
        }else{
            console.log = ( ... params: any )=>{ this.handleLog(LogLevel.DEBUG, params); }
            console.info = ( ... params: any )=>{ this.handleLog(LogLevel.INFO, params); }
            console.debug = ( ... params: any )=>{ this.handleLog(LogLevel.DEBUG, params); }
            console.error = ( ... params: any )=>{ this.handleLog(LogLevel.ERROR, params); }
            console.warn = ( ... params: any )=>{ this.handleLog(LogLevel.WARN, params); }
        }
    }

    addDelegate( delegate : LogDelegate ){
        this.m_delegates.push(delegate);
    }

    handleLog( level : LogLevel, params : any){
        if(this.m_level > level) return;
        this.m_delegates.forEach((delegate)=>{
            delegate.handleLog(level, params);
        })
    }

    enableBattle( uid : number){
        if(this.m_battleLog != null){
            this.m_battleLog.close();
        }
        let battleLog = new LogBattle();
        battleLog.setUID(uid);
        this.m_battleLog = battleLog;
    }

    handleBattleLog( params : any){
        if(this.m_battleLog == null) return;
        this.m_battleLog.handleLog(LogLevel.INFO, params);
    }
}
