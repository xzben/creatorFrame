'use strict';

var Fs = require("fs");
var Path = require("path");

function copyFolderApk (sourceDir, destDir, timestr) {
    copyFolderFile(sourceDir, destDir, timestr, ".apk")
}


function copyFolderBundle (sourceDir, destDir, timestr) {
    copyFolderFile(sourceDir, destDir, timestr, ".aab")
}

function copyFolderFile (sourceDir, destDir, timestr, ext) {
    var stat = Fs.statSync(sourceDir);
    if (!stat.isDirectory()) {
        return;
    }
    var subpaths = Fs.readdirSync(sourceDir), subpath;

    for (var i = 0; i < subpaths.length; ++i) {
        if (subpaths[i][0] === '.') {
            continue;
        }
        let filename = subpaths[i];
        subpath = Path.join(sourceDir, subpaths[i]);
        stat = Fs.statSync(subpath);
        if (stat.isDirectory()) {
            copyFolderFile(subpath, destDir, timestr, ext);
        }else if (stat.isFile() && filename.substr(-4) == ext){
            filename = filename.substr(0, filename.length-4)+timestr+ext;
            let destApkPath = Path.join(destDir, filename);
            Fs.copyFileSync(subpath, destApkPath);
            Fs.unlinkSync(subpath);
        }
    }
}

function getProjectEnv( options ){
    let lauchPath = Path.join(Editor.Project.path, 'assets/launch.scene');    
    let data = Fs.readFileSync(lauchPath, "utf8")
    let newdata = data.match(/"m_gameEnv"\s*:\s*(\d*)/i);
    console.log("getProjectEnv", newdata);
    let curEnv = parseInt(newdata[1]);

    return curEnv
}

function getProjectVersion(){
    let destManifest = Path.join(Editor.Project.path, "assets/resources/", 'version.json');
    let data = Fs.readFileSync(destManifest, "utf8")
    let projectData = JSON.parse(data);

    console.log("getProjectVersion", projectData.version)
    return projectData.version
}

let ENV_NAME = {
    ["0"] : "debug",
    ["1"] : "innertest",
    ["2"] : "outtest",
    ["3"] : "release",
}

function isMakePackageSuccess( msg){
    return -1 != msg.search(/make\s*package.*success/g) || -1 != msg.search(/Build\s*success\s*in/g);
}

exports.methods = {
    builder_ready (id, params){
        if(params.state == "success" && isMakePackageSuccess(params.message)){
            let options = params.options;
            let platform = options.platform;
            if(platform == "android"){
                let env = getProjectEnv(options);
                let version = getProjectVersion();
                let date = new Date();
                let timestr = `_${date.getFullYear()}_${date.getMonth()+1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}`
                let buildAssetRoot = Path.join(Editor.Project.path, "build", options.outputName, "proj/build/", options.name, "outputs");
                let destPath = Path.join(Editor.Project.path, "build", "origin", options.outputName, "apk", version, ENV_NAME[env]);
                if(!Fs.existsSync(destPath)){
                    Fs.mkdirSync(destPath, {recursive: true})
                }
                copyFolderApk(buildAssetRoot, destPath, timestr);
    
                let destAABPath = Path.join(Editor.Project.path, "build", "origin", options.outputName, "bundle", version, ENV_NAME[env]);
                if(!Fs.existsSync(destAABPath)){
                    Fs.mkdirSync(destAABPath, {recursive: true})
                }
                copyFolderBundle(buildAssetRoot, destAABPath, timestr);
            }
        }
    }
};

/**
 * 启动的时候执行的初始化方法
 * Initialization method performed at startup
 */
 exports.load = function() {
     console.log("hotupdate load")
 };

 /**
  * 插件被关闭的时候执行的卸载方法
  * Uninstall method performed when the plug-in is closed
  */
 exports.unload = function() {
    console.log("hotupdate unload")
 };