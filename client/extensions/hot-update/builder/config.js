
'use strict';

let config = {}
config.appname = "bubble"
config.signPath = "native/engine/android/signal/sign.jks"
config.signAlias = "bubble"
config.signPassword = "yckjbubble123" 


config.ENV_NAME = {
    ["0"] : "debug",
    ["1"] : "innertest",
    ["2"] : "outtest",
    ["3"] : "release",
}

//原生资源更新路径
config.ENV_PACKAGE_ROOT = {
    ["0"] : `http://192.168.0.142/nh5game/update/${config.appname}/remote-assets/`,
    ["1"] : `http://192.168.0.142/nh5game/update/${config.appname}/remote-assets/`,
    ["2"] : `https://testgame.yuch188.com/update/${config.appname}/remote-assets/`,
    ["3"] : `https://game.yuch188.com/update/${config.appname}/remote-assets/`,
}

//小游戏远程资源服根路径
config.MINI_GAME_REMOTE_URL = {
    ["0"] : "http://192.168.0.142/nh5game/miniremote/",
    ["1"] : "http://192.168.0.142/nh5game/miniremote/",
    ["2"] : "https://testgame.yuch188.com/miniremote/",
    ["3"] : "https://game.yuch188.com/miniremote/",
}

module.exports = config
