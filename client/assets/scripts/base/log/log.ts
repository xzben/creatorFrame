/*
 * @Author: xzben
 * @Date: 2022-05-25 11:42:02
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 11:54:31
 * @Description: file content
 */
import { LogController } from "./LogController"
import { LogLevel } from "./LogLevel"

function LogBase(level : LogLevel, params : any)
{
    LogController.getInstance().handleLog(level, params)
}

export class log{
    public static i(...params : any[]){
        LogBase(LogLevel.INFO, params)
    }

    public static d(...params : any[]){
        LogBase(LogLevel.DEBUG, params)
    }

    public static w(...params : any[]){
        LogBase(LogLevel.DEBUG, ["################### warn begin ###################"])
        LogBase(LogLevel.WARN, params)
        LogBase(LogLevel.DEBUG, ["################### warn end ###################"])
    }

    public static e(...params : any[]){
        LogBase(LogLevel.DEBUG, ["################### error begin ###################"])
        LogBase(LogLevel.ERROR, params)
        LogBase(LogLevel.DEBUG, ["################### error end ###################"])
    }

    public static enableBattle( uid : number){
        LogController.getInstance().enableBattle(uid);
    }

    public static battle(...params : any[])
    {
        LogController.getInstance().handleBattleLog(params);
    }

    public static LogLevel = LogLevel;
    public static LogController = LogController;
}