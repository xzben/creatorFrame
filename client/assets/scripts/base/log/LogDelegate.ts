import * as cc from "cc"
import { LogLevel } from "./LogLevel";

export interface LogDelegate{
    handleLog(level : LogLevel, params : any) : void;
    close():void;
}