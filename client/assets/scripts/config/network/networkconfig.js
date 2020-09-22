let ENV = require("envConfig").ENV

let networkconfig = {}

networkconfig.SERVER_LIST = {}

networkconfig.SERVER_LIST[ENV.INNER_TEST] = [
    "ws://192.168.1.80:30052/"
];

networkconfig.SERVER_LIST[ENV.OUT_TEST] = [
    "ws://192.168.1.80:30052",
]

networkconfig.SERVER_LIST[ENV.RELEASE] = [
    "ws://192.168.1.80:30052",
]

networkconfig.getCurServerList = function(){
    return networkconfig.SERVER_LIST[config.env.getCurEnv()];
}

networkconfig.CONNECT_TIMEOUT = 10; // 连接超时时间

networkconfig.HEART_GAP     = 5;  // 心跳间隔时间

networkconfig.HEART_TIMEOUT = 10; // 心跳超时时间

export default networkconfig;