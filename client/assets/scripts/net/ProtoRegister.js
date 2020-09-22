const netConfig = require("netConfig");
const PbCmd  = require("PbCmd");

let ProtoRegister = cc.Class({
    name : "ProtoRegister",
    ctor(){
        this.m_files = [ 
            "proto/common",
            "proto/normal",
        ];

        this.m_protos = {}
    },

    registerAll( doneCallback ){
        let isFinish = false
        let count = this.m_files.length;
        this.m_files.forEach(( filename )=>{
            game.ResMgr.getInstance().load(filename, cc.TextAsset, (err, assets)=>{
                count --;
                if(isFinish) return;

                if (err) {
                    bg.Log.e("load proto error ==> ", err)
                    isFinish = true;
                    doneCallback(err, null)
                    return
                }
                
                let pr = protobuf.parse(assets)
                this.m_protos[filename] = pr.root

                if(count <= 0){
                    doneCallback(null, this.m_protos);
                }
            })
        })
        
    },

    getMessage( file, message){
        let proto = this.m_protos[file];
        return proto.lookup(message);
    },

    encode(config, data){
        let message = this.getMessage(config.file, config.message)
        let msg = message.create(data)
        return message.encode(msg).finish();
    },
    
    encodeMessage(cmd, data, session){
        var session = session == null ? 0 : session;
        let config = netConfig.C2S[cmd]
        if( config == null){
            log.e("can't find the config for cmd:", cmd)
            return;
        }
        let buffer = this.encode(config, data)
        let headMessage = this.getHeadMessage();
        let msg = headMessage.create({
            cmd : cmd,
            session : session,
            byte : buffer
        });

        let buf = headMessage.encode(msg).finish();

        return buf;
    },
    decode(config, buffer){
        let dataMessage = this.getMessage(config.file, config.message)

        return dataMessage.decode(buffer);
    },

    getHeadMessage(){
        return this.getMessage("proto/common", "common.CommonHead")
    },

    decodeMessage(buf){
        let headMessage = this.getHeadMessage();
        let headData = headMessage.decode(buf);

        let cmd = headData.cmd
        let session = headData.session
        let config = netConfig.S2C[cmd]

        let data = this.decode(config, headData.byte)

        return { cmd, session, data, headData }
    },
});


module.exports = require("InstanceMgr").createInstance(ProtoRegister);