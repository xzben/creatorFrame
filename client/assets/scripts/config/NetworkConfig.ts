/*
 * @Author: xzben
 * @Date: 2022-05-25 11:37:39
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 11:38:04
 * @Description: file content
 */

import {ENV, getCurEnv} from "./Env";
import { sys } from "cc"

let SERVER_WEB_LIST = {
    [ENV.DEBUG] : [
        "ws://192.168.0.150:4000",
    ],

    [ENV.INNER_TEST] : [
        "ws://192.168.0.150:4000",
    ],

    [ENV.OUT_TEST] : [
        "ws://192.168.0.150:4000",
    ],

    [ENV.RELEASE] : [
        "ws://192.168.0.150:4000",
    ],
}

//原生平台不能使用wss
let SERVER_NATIVE_LIST = {
    [ENV.DEBUG] : [
        "ws://192.168.0.150:4000",
    ],

    [ENV.INNER_TEST] : [
        "ws://192.168.0.150:4000",
    ],

    [ENV.OUT_TEST] : [
        "ws://192.168.0.150:4000",
    ],

    [ENV.RELEASE] : [
        "ws://192.168.0.150:4000",
    ],
}

let ROBOT_ICON_ROOT_URL = {
    [ENV.DEBUG] : "http://192.168.0.142/nh5game/robot/",
    [ENV.INNER_TEST] : "http://192.168.0.142/nh5game/robot/",
    [ENV.OUT_TEST] : "http://192.168.0.142/nh5game/robot/",
    [ENV.RELEASE] : "http://192.168.0.142/nh5game/robot/",
}

let GAME_CONTROL_ROOT_URL = {
    [ENV.DEBUG] : "http://192.168.0.142/nh5game/update/bubble/",
    [ENV.INNER_TEST] : "http://192.168.0.142/nh5game/update/bubble/",
    [ENV.OUT_TEST] : "http://192.168.0.142/nh5game/update/bubble/",
    [ENV.RELEASE] : "http://192.168.0.142/nh5game/update/bubble/",
}

let EXP_SERVER_LIST = SERVER_WEB_LIST;
if(sys.isNative){
    EXP_SERVER_LIST = SERVER_NATIVE_LIST;
}

export let SERVER_LIST = EXP_SERVER_LIST;

export let CONNECT_TIMEOUT = 10 // 连接超时时间

export let HEART_GAP     = 30 // 心跳间隔时间, 间隔发送心跳包的时间

export let HEART_TIMEOUT = 50 // 心跳超时时间

export function getCurServerList():string[]{
    if( sys.isNative ){
        return SERVER_NATIVE_LIST[getCurEnv()];
    }else{
        return SERVER_WEB_LIST[getCurEnv()];
    }
}

export function getRobotRootIconUrl():string{
    return ROBOT_ICON_ROOT_URL[getCurEnv()];
}

export function getGameControlRootUrl():string{
    return GAME_CONTROL_ROOT_URL[getCurEnv()];
}
