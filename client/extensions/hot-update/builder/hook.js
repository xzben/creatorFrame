
'use strict';

var web = require("./web");
var navite = require("./navite");
var minigame = require("./minigame");

// type Platform =
//     | 'web-desktop'
//     | 'web-mobile'
//     | 'wechatgame'
//     | 'oppo-mini-game'
//     | 'vivo-mini-game'
//     | 'huawei-quick-game'
//     | 'alipay-mini-game'
//     | 'mac'
//     | 'ios'
//     // | 'ios-app-clip'
//     | 'android'
//     | 'windows'
//     | 'xiaomi-quick-game'
//     | 'baidu-mini-game'
//     | 'bytedance-mini-game'
//     | 'cocos-play'
//     | 'huawei-agc'
//     | 'link-sure'
//     | 'qtt'
//     | 'cocos-runtime'
//     ;

let BuildBeforeHandleMap = {
    ["mac"] : navite.handleNaviteBeforBuild,
    ["ios"] : navite.handleNaviteBeforBuild,
    ["android"] : navite.handleNaviteBeforBuild,
}


let BuildAfterHandleMap = {
    ["mac"] : navite.handleNaviteAfterBuild,
    ["ios"] : navite.handleNaviteAfterBuild,
    ["android"] : navite.handleNaviteAfterBuild,
    ["windows"] : navite.handleNaviteAfterBuild,
    ["web-desktop"] : web.handleWebAfterBuild,
    ["web-mobile"] : web.handleWebAfterBuild,
    ['wechatgame'] : minigame.handleMiniGameAfterBuild,
    ['bytedance-mini-game'] : minigame.handleMiniGameAfterBuild,
}


let resetRenderPipeline = {
    ["mac"] : true,
    ["ios"] : true,
    ["android"] : true,
    ["windows"] : true,
    ["web-desktop"] : false,
    ["web-mobile"] : false,
    ['wechatgame'] : false,
    ['bytedance-mini-game'] : false,
}

exports.onBeforeBuild = function( options){
    console.log("my before build", options)
    let platform = options.platform;
    let func = BuildBeforeHandleMap[platform];
    if( func ){
        func(options);
    }
}

exports.onBeforeBuildAssets = function( options, result ){
    let platform = options.platform;
    console.log("onBeforeBuildAssets", platform, options, result)
}

exports.onAfterBuildAssets = function( options, result ){
    let platform = options.platform;
    console.log("onAfterBuildAssets", platform, options, result)
}

exports.onBeforeCompressSettings = function(options, result){     
    console.log("my onBeforeCompressSettings", options, result, result.__task.result.settings)
    let platform = options.platform;
    if(resetRenderPipeline[platform]){
        result.__task.result.settings.renderPipeline = "";
    }
    result.__task.result.settings.gameEnv = parseInt(options.packages.mysetting.buildType);
}

exports.onAfterCompressSettings = function( options, result){
    console.log("my onAfterCompressSettings", options, result)
}

exports.onAfterBuild = function (options, result) {
    let platform = options.platform;
    console.log("test-onAfterBuild", platform, options, result)
    
    let func = BuildAfterHandleMap[platform];
    if( func ){
        func(options, result);
    }
}

exports.onBeforeMake = function(root, options){
    console.log("test-onBeforeMake", root, options)
}

exports.onAfterMake = function(root, options){
    console.log("test-onAfterMake", root, options)
}

