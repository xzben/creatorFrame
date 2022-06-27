
'use strict';

var Fs = require("fs");
var Path = require("path");
var Crypto = require('crypto');
var compressing = require("compressing");
var utils = require("./utils");
var process = require('child_process'); 
var config = require("./config");
var localconfig = require("./localconfig");

var manifest = {
    packageUrl: `https://game.yuch188.com/update/${config.appname}/remote-assets/1.0.0.1/`,   //对应每个版本资源的根路径
    remoteManifestUrl: `https://game.yuch188.com/update/${config.appname}/remote-assets/project.manifest`, //远程版本控制文件
    remoteVersionUrl: `https://game.yuch188.com/update/${config.appname}/remote-assets/version.manifest`, //远程版本控制文件
    version: '1.0.0',  //版本号
    assets: {},
    searchPaths: []
};


//判断是否是魅族快游戏
function isMeizuGame( options ){
    return options.platform == "web-mobile" && options.outputName == "meizu-quick";
}

//获取快游戏的路径
var get_quickgame_path = function(options){
    if(isMeizuGame(options)){
        return "meizu";
    }
    return "other";
}


//编译魅族逻辑
function handleMeizuLogic(options){
    let curEnv = utils.getProjectEnv( options );
    let versionName = utils.getProjectVersion(options);
    let versionCode = utils.versionNameToCode(versionName);

    let propertiesRoot = Path.join(Editor.Project.path, "build", options.outputName);
    let path = utils.findFileByDir(propertiesRoot, "application");
    console.log("handleWebAfterBuild application:", path);

    if(Fs.existsSync(path)){
        let re = /loadSettingsJson\s*\(\s*cc\s*\)\s*{[\n\r\s]*var\s*server\s*=\s*'.*';/
        let data = Fs.readFileSync(path, "utf8")
        if (data.search(re) != -1) {
            let rooturl = config.MINI_GAME_REMOTE_URL[curEnv];
            let url = rooturl + get_quickgame_path(options)+"/"+versionName+"/";
            let releaseUrl = `loadSettingsJson(cc){\n\r\tvar server = '${url}';`
            let newdata = data.replace(re, releaseUrl);
            Fs.writeFileSync(path, newdata);
        }else{
            console.log("handleMiniGameAfterBuild search", re)
        }
    }
    
    let manifestPath = Path.join(propertiesRoot, "manifest.json");
    utils.coverFileContent(manifestPath, /("versionName"\s*:\s*")[^"]*(",)/g, `$1${versionName}$2`, false);
    utils.coverFileContent(manifestPath, /("versionCode"\s*:\s*)[\d]*(,)/g, `$1${versionCode}$2`, false);
    utils.replaceFileContent(path, /cc\.view\.resizeWithBrowserSize\(true\);/, "cc.view.resizeWithBrowserSize(true);\r\n\t\tcc.sys.isMEIZU_QUICK = 'MEIZU_QUICK_GAME';");
    
    let indexPath = Path.join(propertiesRoot, "index.html");
    utils.replaceFileContent(indexPath, /src\/import-map\.json/g, "cocos-js/cc.js");
    utils.replaceFileContent(indexPath, /type="systemjs-importmap"/g, "");
    // utils.replaceFileContent(indexPath, /(System.import)/g, `System.import('./sdk.js')\n\t\t$1`);

    //--------------快速拷贝资源文件--------------//
    if(utils.isDirectory(localconfig.MINI_GAME_RES_LOCAL_PATH)){
        let url = Path.join(localconfig.MINI_GAME_RES_LOCAL_PATH, get_quickgame_path(options) , versionName);
        utils.copyFolder(Path.join(propertiesRoot, "/remote") , Path.join(url, '/remote'));
    }
    //-----------------------------------------------//

    //最后压缩备份远程资源remote文件夹
    let destPath = Path.join(Editor.Project.path, 'build', "origin", options.outputName, config.ENV_NAME[curEnv], manifest.version, 'meizu-quick')
    if(!Fs.existsSync(destPath)){
        Fs.mkdirSync(destPath, {recursive: true})
    }
    utils.copyFolder(Path.join(propertiesRoot, "remote") , Path.join(destPath, 'remote'));
    Fs.rmdirSync(Path.join(propertiesRoot, "remote"), {recursive: true});

    const v = Path.join(Editor.Project.path, 'extensions/rpk-packager/bundle.js'); 
    const command =  `cd /d ${propertiesRoot} && node ${v} release --sourcePath . --outputPath . --sign release`
    console.log('exec command :', command);
    process.execSync(command);

    utils.copyFile(Path.join(propertiesRoot, `com.yckj.ccfame.${config.appname}.mz.release.rpk`) , Path.join(destPath, `com.yckj.ccfame.${config.appname}.mz.release.rpk`));
    utils.copyFolder(Path.join(propertiesRoot) , Path.join(destPath, 'meizu-quick'));

    let destZipPath = Path.join(Editor.Project.path, 'build/', "origin", options.outputName, config.ENV_NAME[curEnv], manifest.version)
    compressing.zip.compressDir(destPath, destZipPath + "/verion_" + config.ENV_NAME[curEnv] + "_"+manifest.version + "_"+  utils.dateFormat("YYYY_mm_dd_HH_MM_SS", new Date()) + ".zip").then(() => {
        Fs.rmdirSync(destPath, {recursive: true});
        console.log(`Tips: 文件压缩成功`);
    })
    
}

//编译web版本
exports.handleWebAfterBuild = function(options, result){
    let curEnv = utils.getProjectEnv( options )
    let packageUrl = config.ENV_PACKAGE_ROOT[curEnv];
    let curVersion = utils.getProjectVersion();

    manifest.remoteManifestUrl = packageUrl + "project.manifest";
    manifest.remoteVersionUrl = packageUrl + "version.manifest";
    manifest.version = curVersion;
    manifest.packageUrl = packageUrl + manifest.version + "/";
    manifest.assets = {};
    manifest.searchPaths = [];

    console.log("handleWebAfterBuild", manifest)
    let destManifest = Path.join(Editor.Project.path, "assets/resources/", 'project.manifest');
    Fs.writeFileSync(destManifest, JSON.stringify(config.manifest));

    let destZipPath = Path.join(Editor.Project.path, 'build/', "origin", options.outputName, config.ENV_NAME[curEnv], manifest.version)
    if(!Fs.existsSync(destZipPath)){
        Fs.mkdirSync(destZipPath, {recursive: true})
    }
    
    //拷贝模板文件
    let propertiesRoot = Path.join(Editor.Project.path, "build/", options.outputName);
    let templatePath = Path.join(Editor.Project.path, 'build-template/', options.outputName);
    if(utils.isDirectory(templatePath) && utils.isDirectory(propertiesRoot)){
        utils.copyFolder(templatePath, propertiesRoot);
    }

    //接入魅族快游戏逻辑
    if(isMeizuGame(options)){
        handleMeizuLogic(options)
    }  
}


