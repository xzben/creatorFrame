import { EventDispatcher } from "../frame/EventDispatcher";
import { ProtoRegister } from "./ProtoRegister";
import { utils } from "../utils/utils";
import { CMDC2S, CMDS2C } from "./PbCmd";
import * as networkconfig from "../../config/NetworkConfig"
import { log } from "../log/log";

const HEAD_SIZE = 4;
const MAX_CONNECT_TIMES = 8;

export enum NetStatus{
    CONNECTING = 1,
    CONNECT_SUCCESS = 2,
    CONNECT_CLOSE = 3
}

export enum NetEvent {
    CONNECT_SUCCESS = "__connect_success__",
    CONNECT_FAILED = "__connect_failed__",
    CONNECT_CLOSE = "__connect_close__",
}

let filterLogC2SMsg : any = {
    [CMDC2S.HEART] : true,
    [CMDC2S.MOVE_OPERATE] : true,
    [CMDC2S.PLAY_SKILL] : true,
    [CMDC2S.OTHER_GAME_OP] : true,
    [CMDC2S.LOADING_PRCESS] : true,
}

let filterLogS2CMsg : any = {
    [CMDS2C.HEART] : true,
    [CMDS2C.GAME_FRAME] : true,
    [CMDS2C.SESSION] : true,
    [CMDS2C.LOADING_PROCESS] : true,
}

export type RespCall = ( success : boolean, respData ?: any )=>void;

export class Network extends EventDispatcher {

    private static s_instance : Network | null = null;

    private m_pauseDispatcher : boolean = false;
    private m_stackMessage : Array<any> = new Array();
    private m_socket : WebSocket | null = null;
    private m_status : NetStatus = NetStatus.CONNECT_CLOSE;
    private m_serverList : string[] = [];//服务器连接地址
    private m_curUrlIndex : number = 0; //当前使用的服务器list index
    private m_startConnectTime : number = 0;
    private m_pauseUpdate : boolean = true;
    private m_sessionCount : number = 0;
    private m_sessionRespCall : Map<number, RespCall> = new Map;
    private m_reqRespCall : Map<number, RespCall> = new Map;
    private m_heartWatchDog : number = 0;
    private m_headBuffer : Uint8Array | null = null;
    private m_curHeadSize : number = 0;
    private m_curContentSize : number = 0;
    private m_needContentSize : number = 0;
    private m_dataBuffer : Uint8Array | null = null;
    private m_lastHeartTime : number = 0;
    private m_stopReconnect : boolean = false;

    public static getInstance() : Network{
        if( this.s_instance == null){
            this.s_instance = new Network();
        }
        return this.s_instance;
    }

    public loadBaseUrls(){
       this.m_serverList = networkconfig.getCurServerList();
    }

    public setServerUrls( urls : string[] ){
        this.loadBaseUrls();
        this.m_serverList = urls.concat(this.m_serverList);
    }

    public resetServerUrls( urls : string[]){
        this.m_serverList = urls;
    }

    public getStatus() : NetStatus{
        return this.m_status
    }

    public isClosed() : boolean{
        return this.m_status ==NetStatus.CONNECT_CLOSE;
    }

    public isConnecting() : boolean {
        return this.m_status == NetStatus.CONNECTING;
    }

    public isConnected() : boolean {
        return this.m_status == NetStatus.CONNECT_SUCCESS;
    }

    protected getCurServerUrls( force : boolean = false){
        let size = this.m_serverList.length;
        if(size <= 0) return null;

        let getIndex = this.m_curUrlIndex
        if(force && getIndex >= size)
        {
            getIndex = 0;
            this.m_curUrlIndex = 0;
        }
        this.m_curUrlIndex++;

        return this.m_serverList[getIndex]
    }

    public init( doneCallback : ()=>void ){
        this.loadBaseUrls();
        ProtoRegister.getInstance().registerAll(doneCallback);

        this.addListener(CMDS2C.LOGIN_OTHER, this, this.handleLoginOtherClient)
    }

    handleLoginOtherClient(){
        this.m_stopReconnect = true;
        this.clearSocket();
        utils.MsgBox.showConfirm("账号在其它客户端登录, 点击确定将重新登录!", ()=>{
            this.m_stopReconnect = false;
            this.startNetwork(true);
        })
    }

    protected clear(){
        this.m_sessionRespCall.forEach((callback : RespCall, sessionId : number )=>{
            this.handleSessionResp(sessionId, false)
        })
        this.m_sessionRespCall.clear();

        this.m_reqRespCall.forEach((callback : RespCall, sessionId : number)=>{
            this.handleRequestResp(sessionId, false)
        })
        this.m_reqRespCall.clear();
    }

    protected handleSessionResp(sessionId : number, success : boolean){
        let callback = this.m_sessionRespCall.get(sessionId);
        if(callback)
            callback(success);
        this.m_sessionRespCall.delete(sessionId);
    }

    protected handleRequestResp(sessionId : number, success : boolean, cmd ?: number, data ?: any){
        if(  cmd != CMDS2C.HEART){
            // log.d("##################### Network:handleRequestResp", sessionId);
        }

        let callback = this.m_reqRespCall.get(sessionId);
        if(callback)
            callback(success, data);
        this.m_reqRespCall.delete(sessionId);
    }

    protected clearSocket(){
        if(this.m_socket){
            this.m_socket.onclose = null;
            this.m_socket.onerror = null;
            this.m_socket.onmessage = null;
            this.m_socket.close();
            this.m_socket = null;
            this.m_status = NetStatus.CONNECT_CLOSE;
        }
    }

    protected handlePingSlow(){
        // log.d("handlePingSlow")
    }

    protected handleConnectSuccess(){
        log.d("handleConnectSuccess")
        utils.LoadingView.close();
        this.clear();
    }

    protected handleDisconnect(force ?: boolean){
        this.m_pauseUpdate = true;
        log.d("handleDisconnect")
        utils.LoadingView.close();
        this.clear();
        this.startNetwork(force);
    }

    public disconnect(){
        log.d("disconnect");
        this.clearSocket();
    }

    public connect( url : string ){
        log.d("connect", url);
        this.clearSocket();
        this.m_startConnectTime = utils.time();
        let newSocket = new WebSocket(url);
        this.m_socket = newSocket;
        this.m_socket.binaryType = "arraybuffer"
        this.m_status = NetStatus.CONNECTING

        this.m_socket.onopen = ( event )=>{
            log.d("Network:connect success", this.m_socket);
            this.m_status = NetStatus.CONNECT_SUCCESS;
            this.m_startConnectTime = -1;
            this.eatWatchDog();
            this.handleConnectSuccess();
            this.dispatch(NetEvent.CONNECT_SUCCESS);
        };

        this.m_headBuffer = new Uint8Array(HEAD_SIZE);
        this.m_curHeadSize = 0;
        this.m_curContentSize = 0;
        this.m_needContentSize = 0;
        this.m_dataBuffer = null;

        this.m_socket.onmessage = ( event )=>{
            // console.log("onmessage", event)
            this.handleMsgArrayBuffer(event.data);
        }

        this.m_socket.onerror = (event)=>{
            log.d("Network:onerror 111", event);
            if(newSocket !== this.m_socket) return;
            this.m_status = NetStatus.CONNECT_CLOSE;

            if(this.m_socket){
                this.m_socket = null;
            }
            log.d("Network:onerror", event);

            this.dispatch(NetEvent.CONNECT_CLOSE);
            this.handleDisconnect(false);
        }

        this.m_socket.onclose = ( event : CloseEvent)=>{
            log.d("Network:onclose 111", event.code, event.reason);
            if(newSocket !== this.m_socket)return;
            this.m_status = NetStatus.CONNECT_CLOSE;
            log.d("Network:onclose", event);
            if(this.m_socket){
                this.m_socket = null;
            }
            this.dispatch(NetEvent.CONNECT_CLOSE);
            this.handleDisconnect(true);
        }
    }

    protected handleMsgArrayBuffer( buffer : ArrayBuffer ){
        let result = new Uint8Array(buffer);
        let dataSize = result.length;
        let offset = 0;

        while(offset < dataSize)
        {
            let curHeadSize = this.m_curHeadSize
            let needSize = HEAD_SIZE - curHeadSize
            let curDataSize = dataSize - offset
            // console.log("############", needSize, curHeadSize, dataSize, curDataSize, offset)
            if(needSize > 0 )
            {
                let addSize = needSize
                if( needSize > curDataSize)
                    addSize = curDataSize
                // log.d("############ fileReader.rue")
                
                this.m_headBuffer?.set(result.subarray(offset, offset+addSize), curHeadSize)
                // result.copy(this.m_headBuffer, curHeadSize, offset, offset+addSize)
                offset = offset + addSize;
                this.m_curHeadSize = this.m_curHeadSize + addSize
                if(addSize >= needSize)
                {
                    if(this.m_headBuffer){
                        let headArray = Array.from(this.m_headBuffer);
                        this.m_needContentSize = headArray[0] << 24 | headArray[1] << 16 | headArray[2] << 8 | headArray[3];
                        this.m_dataBuffer = new Uint8Array(this.m_needContentSize);
                        // console.log("############ addSize", addSize, this.m_needContentSize, this.m_headBuffer)
                    }
                }
            }
            else
            {
                let readSize = curDataSize
                let needDataSize = this.m_needContentSize - this.m_curContentSize
                if(curDataSize > needDataSize )
                    readSize = needDataSize
                // log.d("################ other", this.m_needContentSize, readSize)
                this.m_dataBuffer?.set(result.subarray(offset, offset+readSize), this.m_curContentSize)
                // result.copy(this.m_dataBuffer, recvSize, offset, offset+readSize)
                // log.d("################ m_dataBuffer", this.m_dataBuffer, result, recvSize, offset, readSize)
                offset = offset + readSize;
                this.m_curContentSize = this.m_curContentSize + readSize

                if(this.m_curContentSize >= this.m_needContentSize)
                {
                    this.handleMsg(this.m_dataBuffer as ArrayBuffer);
                    this.m_curHeadSize = 0
                    this.m_curContentSize = 0
                    this.m_needContentSize = 0
                    this.m_dataBuffer = null;
                }
            }
        }
    }

    public pauseDispatchMessage(){
        this.m_pauseDispatcher = true;
    }

    public resumeDispatchMessage(){
        this.m_pauseDispatcher = false;
        for(let i = 0; i < this.m_stackMessage.length; i++){
            let item = this.m_stackMessage[i];
            this.doDispatchMessage(item.cmd, item.session, item.data);
        }
        this.m_stackMessage = new Array();
    }

    protected doDispatchMessage( cmd : number, session : number, data : any){
        if( session >= 0){
            this.handleRequestResp(session, true , cmd, data)
            this.handleSessionResp(session, true)
        }

        if( cmd == CMDS2C.SESSION){
            return;
        }
        
        this.dispatch(cmd, data, session);
    }

    protected handleMsg( buffer : ArrayBuffer ){
        let { cmd, session, data } = ProtoRegister.getInstance().decodeMessage(buffer);
        this.eatWatchDog(); //只要收到过消息则清理看门狗
        if( data ){
            if( !filterLogS2CMsg[cmd] ){
                log.d("############## handle message", cmd, session, data)
            }
            
            if(this.m_pauseDispatcher){
                this.m_stackMessage.push({ cmd : cmd, session : session, data : data})
            }else{
                this.doDispatchMessage(cmd, session, data);
            }
        }else{
            log.e("handle message decode failed", buffer);
        }
    }

    protected eatWatchDog(){
        this.m_heartWatchDog = utils.time();
    }

    public startNetwork( force : boolean = false  ){
        if(this.m_stopReconnect){
            return;
        }
        if(this.isConnecting())
        {
            log.d("is connecting!!");
            return; //当前如果正在连接则直接返回
        } 

        if(!this.isConnected()){
            utils.LoadingView.show("开始网络连接");
            let url = this.getCurServerUrls( force );
            if( url == null){
                utils.LoadingView.close();
                this.m_pauseUpdate = true;
                utils.MsgBox.showConfirm("网络连接尝试失败,是否重试?", ()=>{
                    this.m_curUrlIndex = 0;
                    this.m_pauseUpdate = false;
                    this.startNetwork();
                })
            }else{
                this.m_pauseUpdate = false;
                this.connect( url );
            }
        }else{
            log.d("network is work well not need to connect!", this.m_status);
        }
    }

    protected getSessionId(){
        this.m_sessionCount ++;

        return this.m_sessionCount;
    }

    public sendMsg(cmd : number, data : any){
        this.sendMsgImp(cmd, data)
    }

    public sendGameMsg(gameId : number, roomId : number, cmd : number, data : any){
        data.__gameData = { gameId : gameId, roomId : roomId }
        this.sendMsgImp(cmd, data);
    }

    public sendGameMsgDone(gameId : number, roomId : number, cmd : number, data : any, sendOkCallback : RespCall | null = null){
        data.__gameData = { gameId : gameId, roomId : roomId }
        this.sendMsgDone(cmd, data, sendOkCallback);
    }

    public sendGameMsgResp(gameId : number, roomId : number, cmd : number, data : any, respCallback : RespCall | null = null){
        data.__gameData = { gameId : gameId, roomId : roomId }
        this.sendMsgResp(cmd, data, respCallback);
    }

    public sendMsgDone(cmd : number, data : any, sendOkCallback : RespCall | null = null){
        this.sendMsgImp(cmd, data,sendOkCallback)
    }

    public sendMsgResp(cmd : number, data : any, respCallback : RespCall | null = null){
        this.sendMsgImp(cmd, data, null, respCallback);
    }

    protected waitSessionResp(sessionId : number, callback : RespCall){
        this.m_sessionRespCall.set(sessionId, callback);
    }

    protected waitRequestResp(sessionId : number, callback : RespCall){
        this.m_reqRespCall.set(sessionId, callback);
    }

    protected sendMsgImp( cmd : number, data : any, sendOkCallback : RespCall | null = null, respCallback : RespCall | null = null){
        if( !this.isConnected() ){
            if(!this.isConnecting()){
                this.startNetwork();
                log.d("################### send msg failed because connect close:", this.m_status, "start connect");
            }
            return false;
        }

        let sessionId = this.getSessionId();

        let buffer = ProtoRegister.getInstance().encodeMessage(cmd, data, sessionId);
        if( buffer == null)
        {
            log.d("sendMsg failed encode buffer == null");
            return;
        }

        if(sendOkCallback){
            this.waitSessionResp(sessionId, sendOkCallback)
        }

        if(respCallback){
            this.waitRequestResp(sessionId, respCallback);
        }
        
        if(!filterLogC2SMsg[cmd])
            log.d("sendMsg:", cmd, data, sessionId);

        let sendBuff = buffer;
        
        if(buffer instanceof Uint8Array){
            sendBuff = buffer.slice().buffer;
        }
        this.m_socket?.send(sendBuff);
    }

    public update ( dt: number) {
        if(this.m_pauseUpdate) return;

        if(this.checkSocketConnecting()){
            this.handleDisconnect();
            return false;
        }
        
        this.checkHeart();
    }

    public checkHeart( forceSend : boolean = false){
        let curTime = utils.time();
        if( curTime - this.m_heartWatchDog > networkconfig.HEART_TIMEOUT){
            this.handlePingSlow()
        }
        
        if(this.m_status != NetStatus.CONNECT_SUCCESS) return;

        if(!forceSend && this.m_lastHeartTime != null && curTime - this.m_lastHeartTime < networkconfig.HEART_GAP){
            return;
        }
        this.m_lastHeartTime = curTime;

        this.sendMsgResp(CMDC2S.HEART, {
            clientTime : curTime
        }, ( success, data)=>{
            if( success ){
                
                let serverTimer = data.serverTime;
                let clietnTime = data.clientTime;
                utils.setServerOffsetTime(Math.ceil(serverTimer - clietnTime));
                this.eatWatchDog();
            }
        })
    }

    protected checkSocketConnecting()
    {
        //代表已经成功连接了，不需要检测连接超时
        if(this.m_startConnectTime <= 0 )
            return false;
        
        let curTime = utils.time()
        if(curTime -  this.m_startConnectTime > networkconfig.CONNECT_TIMEOUT)
        {
            this.clearSocket();
            return true;
        }

        return false;
    }

}
