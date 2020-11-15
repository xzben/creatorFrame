const Buffer = require('buffer').Buffer
const HEAD_SIZE = 4;
const MAX_CONNECT_TIMES = 8

let Network = cc.Class({
    name : "Network",
    extends: frame.EventDispatcher,
    
    ctor(){
        this.m_socket = null;
        this.m_status = constant.NetStatus.CONNECT_CLOSE;
        this.m_serverList = []; //服务器连接地址
        this.m_curUrlIndex = 0; //当前使用的服务器list index

        this.m_startConnectTime = 0;
        this.m_pauseUpdate = false;
        this.m_sessionCount = 0;
        this.m_sessionRespCall = {}
        this.m_reqRespCall = {}
    },
    
    getPlayerService(){
        if(this.m_playerService == null){
            this.m_playerService = game.ServiceMgr.getInstance().getService("PlayerService");
        }
        return this.m_playerService;
    },
    
    loadBaseUrls(){
        this.m_serverList = config.network.getCurServerList();
    },

    setServerUrls( urls ){
        this.loadBaseUrls();
        this.m_serverList = urls.concat(this.m_serverList);
    },

    getStatus(){
        return this.m_status
    },

    isClosed(){
        return this.m_status == constant.NetStatus.CONNECT_CLOSE;
    },

    isConnecting(){
        return this.m_status == constant.NetStatus.CONNECTING;
    },

    isConnected(){
        return this.m_status == constant.NetStatus.CONNECT_SUCCESS;
    },

    getCurServerUrls(){
        let size = this.m_serverList.length;
        if(size <= 0) return null;

        let getIndex = this.m_curUrlIndex
        this.m_curUrlIndex++;

        return this.m_serverList[getIndex]
    },

    init( doneCallback ){
        this.loadBaseUrls();
        net.ProtoRegister.getInstance().registerAll(doneCallback);
    },

    clear(){
        for(var sessionId in this.m_sessionRespCall){
            this.handleSessionResp(sessionId, false)
        }

        for(var sessionId in this.m_reqRespCall){
            this.handleRequestResp(sessionId, false)
        }
        this.m_sessionRespCall = {}
        this.m_reqRespCall = {}
    },

    handleSessionResp(sessionId, success){
        let info = this.m_sessionRespCall[sessionId];
        if(info == null || typeof(info.callback) != "function") return;

        info.callback(success)
        this.m_sessionRespCall[sessionId] = null;
    },

    handleRequestResp(sessionId, success, cmd, data){
        if( cmd != net.PbCmd.S2C.HEART){
            log.d("##################### Network:handleRequestResp", sessionId);
        }

        let info = this.m_reqRespCall[sessionId];
        if(info == null || typeof(info.callback) != "function") return;

        info.callback(success, data, cmd)

        this.m_reqRespCall[sessionId] = null;
    },
    
    clearSocket(){
        if(this.m_socket){
            this.m_socket.onclose = null;
            this.m_socket.onerror = null;
            this.m_socket.onmessage = null;
            this.m_socket.close();
            this.m_socket = null;
            this.m_status = constant.NetStatus.CONNECT_CLOSE;
        }
    },

	handlePingSlow(){

    },
    
    handleConnectSuccess(){
        common.LoadingView.getInstance().close()
        this.clear();
    },
    
    handleDisconnect(){
        common.LoadingView.getInstance().close()
        this.clear();
        this.startNetwork();
    },

    connect( url ){
        log.d("network:connect", url);
        this.clearSocket();
        this.m_startConnectTime = util.os.time();
        let newSocket = new WebSocket(url);
        this.m_socket = newSocket;
        
        this.m_status = constant.NetStatus.CONNECTING
        let other = this
        this.m_socket.onopen = function( event ){
            log.d("Network:connect success", other.m_socket);
            other.m_status = constant.NetStatus.CONNECT_SUCCESS;
            other.m_startConnectTime = -1;
            other.eatWatchDog();
            other.handleConnectSuccess();
            other.event(constant.NetEvent.CONNECT_SUCCESS);
        };

        this.m_headBuffer = new Buffer(HEAD_SIZE);
        this.m_curHeadSize = 0;
        this.m_curContentSize = 0;
        this.m_needContentSize = 0;
        this.m_dataBuffer = null;

        this.m_socket.onmessage = function( event ){
            other.handleMsgArrayBuffer(event.data)
        }

        this.m_socket.onerror = function(event){
            log.d("Network:onerror 111", event);
            if(newSocket !== other.m_socket) return;
            other.m_status = constant.NetStatus.CONNECT_CLOSE;

            if(other.m_socket){
                delete other.m_socket;
                other.m_socket = null;
            }
            log.d("Network:onerror", event);

            other.handleDisconnect();
            other.event(constant.NetEvent.LOST_CONNECT);
        }

        this.m_socket.onclose = function( event ){
            log.d("Network:onclose 111", event);
            if(newSocket !== other.m_socket)return;
            other.m_status = constant.NetStatus.CONNECT_CLOSE;
            log.d("Network:onclose", event);
            if(other.m_socket){
                delete other.m_socket;
                other.m_socket = null;
            }

            other.handleDisconnect();
            other.event(constant.NetEvent.LOST_CONNECT);
        }
    },

	checkSocketConnecting()
	{
		var curTime = util.os.time()
		if(this.m_startConnectTime <= 0 )
			return false;

		if(curTime -  this.m_startConnectTime > config.network.CONNECT_TIMEOUT)
		{
			this.clearSocket();
   			return true;
		}

		return false;
    },
    
    eatWatchDog(){
        this.m_heartWatchDog = util.os.time();
    },

    checkHeart(){
        if(!this.getPlayerService().isLogined()) return;

        let curTime = util.os.time();
        if( curTime - this.m_heartWatchDog > config.network.HEART_TIMEOUT){
            return this.handlePingSlow()
        }

        if(this.m_lastHeartTime != null && curTime - this.m_lastHeartTime < config.network.HEART_GAP){
            return;
        }

        this.m_lastHeartTime = curTime;

        this.sendMsgResp(net.PbCmd.C2S.HEART, {
            clientTime : curTime
        }, ( success, data)=>{
            if( success ){
                util.os._handleSynServerTimeResponse(data)
                this.eatWatchDog();
            }
        })
    },

    update(dt){
        if(this.m_pauseUpdate) return;

        if(this.checkSocketConnecting()){
            this.handleDisconnect();
            return false;
        }

        this.checkHeart();
    },

    handleMsgArrayBuffer( buffer ){
        var result = new Buffer(buffer)
        var dataSize = result.length
        var offset = 0

        while(offset < dataSize)
        {
            var curHeadSize = this.m_curHeadSize
            var needSize = HEAD_SIZE - curHeadSize
            var curDataSize = dataSize - offset
            // log.d("############", needSize, curHeadSize, dataSize, curDataSize, offset)
            if(needSize > 0 )
            {
                var addSize = needSize
                if( needSize > curDataSize)
                    addSize = curDataSize
                // log.d("############ fileReader.rue")
                result.copy(this.m_headBuffer, curHeadSize, offset, offset+addSize)
                offset = offset + addSize;
                this.m_curHeadSize = this.m_curHeadSize + addSize
                if(addSize >= needSize)
                {
                    this.m_needContentSize = this.m_headBuffer.readUInt32BE(0)
                    this.m_dataBuffer = new Buffer(this.m_needContentSize);
                    // log.d("############ addSize", addSize, this.m_needContentSize, this.m_headBuffer)
                }
            }
            else
            {
                var readSize = curDataSize
                var needDataSize = this.m_needContentSize - this.m_curContentSize
                if(curDataSize > needDataSize )
                    readSize = needDataSize
                // log.d("################ other", this.m_needContentSize, readSize)
                var recvSize = this.m_curContentSize;
                result.copy(this.m_dataBuffer, recvSize, offset, offset+readSize)
                // log.d("################ m_dataBuffer", this.m_dataBuffer, result, recvSize, offset, readSize)
                offset = offset + readSize;
                this.m_curContentSize = this.m_curContentSize + readSize

                if(this.m_curContentSize >= this.m_needContentSize)
                {
                    this.handleMsg(this.m_dataBuffer);

                    this.m_headBuffer = new Buffer(HEAD_SIZE);
                    this.m_curHeadSize = 0
                    this.m_curContentSize = 0
                    this.m_needContentSize = 0
                    this.m_dataBuffer = null;
                }
            }
        }
    },

    handleMsg( buffer ){
        let { cmd, session, data } = net.ProtoRegister.getInstance().decodeMessage(buffer);
        
        if( data ){
            if( cmd != net.PbCmd.S2C.HEART && cmd != net.PbCmd.S2C.SESSION){
                log.d("############## handle message", cmd, session, data)
            }

            if( cmd == net.PbCmd.S2C.SESSION){
                return this.handleSessionResp(session, true)
            }

            if( session >= 0){
                this.handleRequestResp(session, true, cmd, data)
            }
            log.d("handleMsg", cmd, data)
            this.event(cmd, data, session);
        }else{
            log.e("handle message decode failed", buffer);
        }     
    },

    startNetwork(){
        if(this.isConnecting()) return; //当前如果正在连接则直接返回

        if(this.isClosed()){
            common.LoadingView.getInstance().show("network_start_connecting");
            let url = this.getCurServerUrls();
            if( url == null){
                common.LoadingView.getInstance().close();
                this.m_pauseUpdate = true;
                common.MsgBox.showConfirm("network_connected_failed_retry", ()=>{
                    this.m_curUrlIndex = 0;
                    this.m_pauseUpdate = false;
                    this.startNetwork();
                });
            }else{
                this.connect( url );
            }
        }else{
            log.d("network is work well not need to connect!", this.m_status);
        }
    },

    getSessionId(){
        this.m_sessionCount ++;

        return this.m_sessionCount;
    },

    sendMsg(cmd, data){
        this.sendMsgImp(cmd, data)
    },

    sendMsgDone(cmd, data, sendOkCallback){
        this.sendMsgImp(cmd, data,sendOkCallback)
    },

    sendMsgResp(cmd, data, respCallback){
        this.sendMsgImp(cmd, data, null, respCallback);
    },

    waitSessionResp(sessionId, callback){
        if( this.m_sessionRespCall == null){
            this.m_sessionRespCall = {}
        }

        this.m_sessionRespCall[sessionId] = { callback : callback };
    },

    waitRequestResp(sessionId, callback){
        if( this.m_reqRespCall == null){
            this.m_reqRespCall = {}
        }
        this.m_reqRespCall[sessionId] = { callback : callback };
    },

    sendMsgImp( cmd, data, sendOkCallback, respCallback){
        if( !this.isConnected() ){
            if(!this.isConnecting()){
                this.startNetwork();
                log.d("################### send msg failed because connect close:", this.m_status, "start connect");
            }
            return false;
        }

        let sessionId = this.getSessionId();

        let buffer = net.ProtoRegister.getInstance().encodeMessage(cmd, data, sessionId);
        if( buffer == null) 
        {
            log.e("sendMsg failed encode buffer == null");
            return;
        }   

        if(typeof(sendOkCallback) == "function"){
            this.waitSessionResp(sessionId, sendOkCallback)
        }

        if(typeof(respCallback) == "function"){
            this.waitRequestResp(sessionId, respCallback);
        }
        
        let len = buffer.byteLength;
		let sendBuf = new ArrayBuffer(HEAD_SIZE);
		let intBuf = new Int32Array(sendBuf);
		intBuf[0] = len;
        log.d("sendMsg buffer:", cmd, data, len, buffer)
        this.m_socket.send(sendBuf)
		this.m_socket.send(buffer);
    }
})

module.exports = frame.InstanceMgr.createInstance(Network)