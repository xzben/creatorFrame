
'use strict';

var Fs = require("fs");
var Path = require("path");
var Crypto = require('crypto');
var utils = require("./utils");
var config = require("./config");
var localconfig = require("./localconfig");
var compressing = require("compressing");


var isQQMiniGame = function( options ){
    return options.platform == "wechatgame" && options.outputName == "qqgame";
}

var get_minigame_path = function(options){
    if(options.platform == "wechatgame"){
        if(isQQMiniGame(options)){
            return "qq"
        }else{
            return "wx";
        }
    }else if(options.platform == "bytedance-mini-game"){
        return "byte";
    }
    return "other";
}

var createMiniGameRemoteAsset = function(options){
    let curEnv = utils.getProjectEnv( options )
    let curVersion = utils.getProjectVersion(options);

    let buildAssetRoot = Path.join(Editor.Project.path, "build/", options.outputName);

    let destZipPath = Path.join(Editor.Project.path, "build/", "origin", options.outputName, config.ENV_NAME[curEnv], curVersion)
    if(!Fs.existsSync(destZipPath)){
        Fs.mkdirSync(destZipPath, {recursive: true})
    }
    compressing.zip.compressDir(buildAssetRoot, destZipPath + "/verion_" +config.ENV_NAME[curEnv]+"_"+curVersion + "_"+  utils.dateFormat("YYYY_mm_dd_HH_MM_SS", new Date()) + ".zip");
}

var isLandGame = function( options ){
    let platform = options.platform;
    let packages = options['packages'];
    let setting = packages[platform];
    let orientation = setting.orientation
    
    if(orientation.indexOf("landscape")){
        return true;
    }

    return false;
}

exports.handleMiniGameAfterBuild = function(options, result){
    let curEnv = utils.getProjectEnv( options );
    let version =  utils.getProjectVersion(options);

    let propertiesRoot = Path.join(Editor.Project.path, "build/", options.outputName);
    let path = utils.findFileByDir(propertiesRoot, "application")
    console.log("handleMiniGameAfterBuild", path)
    if(Fs.existsSync(path)){
        let re = /loadSettingsJson\s*\(\s*cc\s*\)\s*{[\n\r\s]*var\s*server\s*=\s*'.*';/
        let data = Fs.readFileSync(path, "utf8")
        if (data.search(re) != -1) {
            let rooturl = config.MINI_GAME_REMOTE_URL[curEnv];
            let url = rooturl + get_minigame_path(options)+"/"+version+"/";
            let releaseUrl = `loadSettingsJson(cc){\n\r\tvar server = '${url}';`
            let newdata = data.replace(re, releaseUrl);
            Fs.writeFileSync(path, newdata);
        }else{
            console.log("handleMiniGameAfterBuild search", re)
        }
    }

    let templatePath = Path.join(Editor.Project.path, 'build-template/', options.outputName);
    if(utils.isDirectory(templatePath) && utils.isDirectory(propertiesRoot)){
        utils.copyFolder(templatePath, propertiesRoot);
    }
    let content = "require('./sdk.js');\n";
    if(isLandGame(options)){
        content = content + "require('./redefine.js');\n"
    }
    utils.insertFileFrontData(propertiesRoot + '/game.js', content);
    if(isQQMiniGame(options)){
        utils.replaceFileContent(path, /cc\.view\.resizeWithBrowserSize\(true\);/, "cc.view.resizeWithBrowserSize(true);\r\n\t\tcc.sys.isQQ_MINI = 'QQ_MINI_GAME';");
    }
    //--------------快速拷贝资源文件--------------//
    if(utils.isDirectory(localconfig.MINI_GAME_RES_LOCAL_PATH)){
        let url = Path.join(localconfig.MINI_GAME_RES_LOCAL_PATH, get_minigame_path(options) , version);
        // utils.replaceFileContent(path, /'http.*\/\'/, "'http://192.168.0.17:8081/" + get_minigame_path(options)+"/"+version+"/'");
        utils.copyFolder(Path.join(propertiesRoot, "/remote") , Path.join(url, '/remote'));
        Fs.rmdirSync(Path.join(propertiesRoot, "/remote"), {recursive: true});
    }
    //-----------------------------------------------//

    createMiniGameRemoteAsset(options);
}




