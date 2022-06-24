import { LogDelegate } from "./LogDelegate";
import { LogLevel } from "./LogLevel";

export class LogConsole  implements LogDelegate{
    private m_funcs : any = {};

    constructor(){
        this.m_funcs[LogLevel.INFO] = console.info;
        this.m_funcs[LogLevel.DEBUG] = console.debug;
        this.m_funcs[LogLevel.WARN] = console.warn;
        this.m_funcs[LogLevel.ERROR] = console.error;
    }
    
    close(): void {
        throw new Error("Method not implemented.");
    }

    public handleLog(level : LogLevel, params : any) : void{
        let func = this.m_funcs[level] || console.info;

        func.apply(null, params);
        if(level >= LogLevel.WARN && level <= LogLevel.ERROR)
        {
            // console.trace();
        }
    }
}
