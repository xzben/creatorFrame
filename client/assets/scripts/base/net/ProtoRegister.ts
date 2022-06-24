// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import {netConfig} from "./netConfig";
import { CMDC2S, CMDS2C } from "./PbCmd";
import { SceneMgr } from "../core/SceneMgr";
import { log } from "../log/log";

type RegisterDoneCallback = (err : Error | null, protos : any | null) =>void;

export class ProtoRegister {
    static s_instances: ProtoRegister | null = null;
    public static getInstance(): ProtoRegister {
        if (this.s_instances == null) {
            this.s_instances = new ProtoRegister();

        }
        return this.s_instances;
    }

    private m_files : string[] = [];
    private m_protos : any = {};
    private m_builder : any = null!;

    constructor() {
        this.m_files = [
            "proto/battle",
            "proto/common",
            "proto/email",
            "proto/game",
            "proto/hero",
            "proto/login_activity",
            "proto/normal",
            
        ];

        this.m_protos = {}
    }

    registerFiles( files : string[], doneCallback : RegisterDoneCallback){
        let isFinish = false
        let count = files.length;
        let tempWind : any = window;
        let protobuf : any = tempWind["dcodeIO"]["ProtoBuf"];

        let builder = protobuf.newBuilder();
        builder.importRoot = "resources/proto";
        this.m_builder = builder;

        files.forEach(( filename )=>{
            SceneMgr.getInstance().getSceneResLoader().loadTextAsset(filename, (err, assets)=>{
                count --;
                if(isFinish) return;

                if (err) {
                    console.log("load proto error ==> ", err);
                    isFinish = true;
                    doneCallback(err, null)
                    return
                }
                let pr = protobuf.loadProto(assets, builder)
                this.m_protos[filename] = pr.build();

                if(count <= 0){
                    doneCallback(null, this.m_protos);
                }
            })
        })
    }

    registerAll( doneCallback : RegisterDoneCallback ){
        this.registerFiles(this.m_files, doneCallback);
    }

    getMessage( file : string, message : string){
        let proto = this.m_protos[file];
        let packagename = "";
        let messagename = message;
        let arr = message.split(".");
        
        if(arr.length > 1){
            packagename = arr[0];
            messagename = arr[1];
        }

        let packagemsg = proto[packagename];
        let msg = packagemsg[messagename];
        return  msg;
    }

    encode(config : any, data : any){
        let message = this.getMessage(config.file, config.message);
        return this.doEncodeMessage(message, data);
    }

    private doEncodeMessage( message : any, data : any){
        data.__object_id__ = undefined;
        data.__native_class_name__ = undefined;
        let msg = new message(data);
        let buf = msg.encode();
        return buf.slice();
    }

    encodeMessage(cmd : CMDC2S, data : any, session : number) : ArrayBuffer | null{
        let sessionId = session == null ? 0 : session;
        let C2S : any = netConfig.C2S;
        let config = C2S[cmd];
        if( config == null){
            console.log("can't find the config for cmd:", cmd)
            return null;
        }

        if( cmd >= 10000){
            let gameData = data.__gameData;
            data.__gameData = undefined;
            
            if( gameData == null || gameData.roomId == null || gameData.gameId == null){
                console.error("please use sendGameMsg to send GameMsg");
            }
            let gameId = gameData.gameId;
            let roomId = gameData.roomId;
            let buffer = this.encode(config, data)
            let gameHeadMessage = this.getGameHeadMessage();
            
            buffer = this.doEncodeMessage(gameHeadMessage, {
                gameId : gameId,
                roomId : roomId,
                byte : buffer,
            })

            let headMessage = this.getHeadMessage();    
            let buf = this.doEncodeMessage(headMessage, {
                cmd : cmd,
                session : sessionId,
                byte : buffer
            })
            
            
            let databuffer = buf.view.slice(0, buf.limit);

            return databuffer
        }else{
            let buffer = this.encode(config, data)
            let headMessage = this.getHeadMessage();
            let buf = this.doEncodeMessage(headMessage, {
                cmd : cmd,
                session : sessionId,
                byte : buffer
            })
            // console.log("encodeMessage", msg, buffer, buf)

            let databuffer = buf.view.slice(0, buf.limit);
            return databuffer
        }
    }

    decode(config : any, buffer : ArrayBuffer) : any{
        let dataMessage = this.getMessage(config.file, config.message)

        return dataMessage.decode(buffer);
    }

    getHeadMessage() : any{
        return this.getMessage("proto/common", "common.CommonHead")
    }

    getGameHeadMessage() : any{
        return this.getMessage("proto/common", "common.GameHead")
    }

    decodeMessage(buf : ArrayBuffer | null) : any{
        if(buf == null) return null;
        let tempWind : any = window;
        let ByteBuffer : any = tempWind["dcodeIO"]["ByteBuffer"];

        if(!ByteBuffer.isByteBuffer(buf))
            buf = ByteBuffer.wrap(buf);

        let headMessage = this.getHeadMessage();
        let headData = headMessage.decode(buf);

        let cmd = headData.cmd;
        let session = headData.session
        let S2C : any = netConfig.S2C
        let config = S2C[cmd]
        // console.log("decode message", cmd)
        if( cmd >= 10000){
            let bytes = headData.byte || new ByteBuffer(0);
            let gameHeadMessage = this.getGameHeadMessage()
            let gameData = gameHeadMessage.decode(bytes)
            bytes = gameData.byte || new ByteBuffer(0)

            let data = this.decode(config, bytes)
            data.__gameData = gameData
            return { cmd, session, data, headData }
        }else{
            let bytes = headData.byte || new ByteBuffer(0);
            let data = this.decode(config, bytes)
            return { cmd, session, data, headData }
        }
    }


}
