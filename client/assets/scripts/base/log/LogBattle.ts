import * as cc from "cc"
import { LogDelegate } from "./LogDelegate";
import { LogLevel } from "./LogLevel";

export class LogBattle  implements LogDelegate{
    private m_uid = 0;
    private m_content = "";
    private m_file = "";

    private m_fileObject : any = null;

    protected getLogFile(){
        let date = new Date();
        let root = jsb.fileUtils.getWritablePath()+"/battlelog/";
        if(!jsb.fileUtils.isDirectoryExist(root)){
            jsb.fileUtils.createDirectory(root);
        }
        let logfile = root+this.m_uid+"_time_"+date.getTime().toLocaleString()+".log";
        return logfile;
    }

    public setUID( uid : number){
        this.m_uid = uid
        
        let enable = false;

        if(cc.sys.isNative){
            this.m_file = this.getLogFile();
            let myGlobal : any = window;
            let myjsb = myGlobal.myjsb;

            if(myjsb){
                enable = true;
            }
            if(jsb.fileUtils.isFileExist(this.m_file)){
                jsb.fileUtils.removeFile(this.m_file);
            }
        }else{
            let date = new Date();
            this.m_file = this.m_uid + "_time_" + date.getTime().toLocaleString() + ".log";
        }

        console.log("battle log", enable, this.m_file);
    }

    private initFileObject(){
        let myGlobal : any = window;
        let myjsb = myGlobal.myjsb
        if(cc.sys.isNative && myjsb){
            if(this.m_fileObject == null){

                this.m_fileObject = new myjsb.FileObject(this.m_file, "w+");
            }
        }
    }

    public close(){
        if(this.m_fileObject){
            this.m_fileObject.close();
        }
    }
    
    public handleLog(level : LogLevel, params : any) : void{
        this.initFileObject();

        if(this.m_fileObject)
        {
            let str = "";
            for(let i = 0; i < params.length; i++){
                str += params[i].toString();
            }
            str+= "\r\n";

            this.m_fileObject.write(str);
        }
        else{
            let str = "";
            for(let i = 0; i < params.length; i++){
                str += params[i].toString();
            }
            console.info(str)
        }
    }
}
