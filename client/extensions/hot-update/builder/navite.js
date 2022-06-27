
'use strict';

var Fs = require("fs");
var Path = require("path");
var config = require("./config");
var utils = require("./utils");
var process = require('child_process'); 
var compressing = require("compressing");

var inject_script = `
(function () {
    if (typeof window.jsb === 'object') {
        try{
            let storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'updateContent') +'/';
            console.log("update storagePath", storagePath)
            let localManifestPath = localStorage.getItem("HotUpdateLocalManifestFilePath");
            if(localManifestPath){
                let cacheManifestPath = storagePath+"project.manifest";
                console.log("localManifestPath", localManifestPath)
                console.log("cacheManifestPath", cacheManifestPath)
                if(jsb.fileUtils.isFileExist(localManifestPath) && jsb.fileUtils.isFileExist(cacheManifestPath)){
                    let localContent = jsb.fileUtils.getStringFromFile(localManifestPath);
                    let remoteContent = jsb.fileUtils.getStringFromFile(cacheManifestPath);
                    let localJson = JSON.parse(localContent);
                    let remoteJson = JSON.parse(remoteContent);
        
                    let versionCmp = function( versionA , versionB){
                        let vA = versionA.split(".");
                        let vB = versionB.split(".");
                
                        for(let i = 0; i < vA.length; i++){
                            let a = parseInt(vA[i]);
                            let b = parseInt(vB[i] || "0");
                
                            if( a === b){
                                continue
                            }else{
                                return a - b;
                            }
                        }
                
                        if(vB.length > vA.length){
                            return -1;
                        }else{
                            return 0;
                        }
                    }
        
                    if(versionCmp(localJson["version"], remoteJson["version"]) >= 0){
                        jsb.fileUtils.removeDirectory(storagePath);
                        jsb.fileUtils.createDirectory(storagePath);
                        return;
                    }
                }
            }
            
            let hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
            if (hotUpdateSearchPaths && localManifestPath) {
                var paths = JSON.parse(hotUpdateSearchPaths);
                jsb.fileUtils.setSearchPaths(paths);
    
                var fileList = [];
                var tempPath = storagePath + '_temp/';
                var baseOffset = tempPath.length;
                
                if (jsb.fileUtils.isDirectoryExist(tempPath) && !jsb.fileUtils.isFileExist(tempPath + 'project.manifest.temp')) {
                    jsb.fileUtils.listFilesRecursively(tempPath, fileList);
                    fileList.forEach(srcPath => {
                        var relativePath = srcPath.substr(baseOffset);
                        var dstPath = storagePath + relativePath;
    
                        if (srcPath[srcPath.length] == '/') {
                            jsb.fileUtils.createDirectory(dstPath)
                        }
                        else {
                            if (jsb.fileUtils.isFileExist(dstPath)) {
                                jsb.fileUtils.removeFile(dstPath)
                            }
                            jsb.fileUtils.renameFile(srcPath, dstPath);
                        }
                    })
                    jsb.fileUtils.removeDirectory(tempPath);
                }
            }
        }catch( err ){
            console.error("init game failed", err.message );
        }
    }
})();
`;

function isProjectManifestFile( projectData ){
    if(projectData[3] && projectData[3][0] && projectData[3][0][0])
    {
        let typeInfo = projectData[3][0][0];
        if(typeof(typeInfo) != "string" || typeInfo != "cc.Asset")
            return false;
    
        return projectData[5] && projectData[5][0] && projectData[5][0][1] == "project" && typeof(projectData[5][0][2]) == "string"
    }else{
        return false;
    }
}

function updateLocalAssetProjectVersion( dir, root,  manifest){
    var stat = Fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    var subpaths = Fs.readdirSync(dir), subpath, size, md5, compressed, relative;
    for (var i = 0; i < subpaths.length; ++i) {
        if (subpaths[i][0] === '.') {
            continue;
        }
        subpath = Path.join(dir, subpaths[i]);
        stat = Fs.statSync(subpath);
        if (stat.isDirectory()) {
            updateLocalAssetProjectVersion(subpath, root, manifest);
        }
        else if (stat.isFile()) {
            let extname = subpath.substr(-4);
            if(extname != "json"){
                continue;
            }
            let data = Fs.readFileSync(subpath, "utf8")
            console.log("Fs.readFileSync", subpath);

            let projectData = JSON.parse(data);
            if(isProjectManifestFile(projectData)){
                let assets = manifest.assets;
                
                let importpath = Path.relative(Path.join(root, "assets/resources/import/"), subpath);
                let nativepath = Path.join(root,"/assets/resources/native/", importpath);
                nativepath = nativepath.slice(0, -4) + "manifest";
                console.log("updateLocalAssetProjectVersion project 222", subpath, nativepath, typeof(nativepath));
                let nativeStat = Fs.statSync(nativepath);
                relative = Path.relative(root, nativepath);
                relative = relative.replace(/\\/g, '/');
                relative = encodeURI(relative);
                assets[relative] = {
                    size : nativeStat['size'],
                    md5 : "norchange",
                }
                let projectStr = JSON.stringify(manifest);
                Fs.writeFileSync(nativepath, projectStr);
            }
        }
    }
}

var manifest = {
    packageUrl: `https://xxx.com/update/${config.appname}/remote-assets/1.0.0.1/`,   //对应每个版本资源的根路径
    remoteManifestUrl: `https://xxx.com/update/${config.appname}/remote-assets/project.manifest`, //远程版本控制文件
    remoteVersionUrl: `https://xxx.com/update/${config.appname}/remote-assets/version.manifest`, //远程版本控制文件
    version: '1.0.0',  //版本号
    assets: {},
    searchPaths: []
};

var createRemoteAsset = function(options){
    let curEnv = utils.getProjectEnv( options )
    let curVersion = utils.getProjectVersion();

    let packageUrl = config.ENV_PACKAGE_ROOT[curEnv];
    
    manifest.remoteManifestUrl = packageUrl + "project.manifest";
    manifest.remoteVersionUrl = packageUrl + "version.manifest";
    manifest.version = curVersion;
    manifest.packageUrl = packageUrl + manifest.version + "/";
    manifest.assets = {};
    manifest.searchPaths = [];

    let destRootPath = Path.join(Editor.Project.path, "build", "tempDir", options.outputName);
    let destPath = Path.join(destRootPath, manifest.version);
    if(Fs.existsSync(destRootPath)){
        Fs.rmdirSync(destRootPath, {recursive: true});
    }
    Fs.mkdirSync(destPath, {recursive: true});

    let buildAssetRoot = Path.join(Editor.Project.path, "build", options.outputName, "assets");
    utils.readDir(Path.join(buildAssetRoot, "src"), buildAssetRoot, manifest.assets);
    utils.readDir(Path.join(buildAssetRoot, "assets"), buildAssetRoot, manifest.assets);
    utils.readDir(Path.join(buildAssetRoot, "jsb-adapter"), buildAssetRoot, manifest.assets);
    updateLocalAssetProjectVersion(Path.join(buildAssetRoot, "/assets/resources/import"), buildAssetRoot, manifest);
    let destManifest = Path.join(Editor.Project.path, "assets/resources/", 'project.manifest');
    Fs.writeFileSync(destManifest, JSON.stringify(manifest));

    Fs.writeFileSync(Path.join(destPath, "project.manifest"), JSON.stringify(manifest))
    delete manifest.assets;
    delete manifest.searchPaths;

    Fs.writeFileSync(Path.join(destPath, "version.manifest"), JSON.stringify(manifest))
    utils.copyFolder(Path.join(buildAssetRoot), destPath);


    let destZipPath = Path.join(Editor.Project.path, "build", "origin", options.outputName, "res", config.ENV_NAME[curEnv], manifest.version)
    if(!Fs.existsSync(destZipPath)){
        Fs.mkdirSync(destZipPath, {recursive: true})
    }
    compressing.zip.compressDir(destPath, destZipPath + "/verion_" + config.ENV_NAME[curEnv]+ "_" + manifest.version + "_"+  utils.dateFormat("YYYY_mm_dd_HH_MM_SS", new Date()) + ".zip");
}

exports.handleNaviteBeforBuild = function(options){
    console.log("handleNaviteBeforBuild", options)
    let platform = options.platform;
    let curEnv = utils.getProjectEnv( options )
    if (platform == "android") {
        
    }else if(platform == "ios"){
        let versionName = utils.getProjectVersion(options);
        let versionCode = utils.versionNameToCode(versionName);
        let InfoFile = Path.join(Editor.Project.path, 'native/engine/ios/Info.plist');
        utils.replaceFileContent(InfoFile, /(<key>CFBundleVersion<\/key>[\r\n\t]*)(<string>[\d\.]*<\/string>)/g, `$1<string>${versionCode}</string>`);
        utils.replaceFileContent(InfoFile, /(<key>CFBundleShortVersionString<\/key>[\r\n\t]*)(<string>[\d\.]*<\/string>)/g, `$1<string>${versionName}</string>`);    
    }
}


exports.handleNaviteAfterBuild = function( options, result ){
    console.log("handleNaviteAfterBuild", options, result)
    let curEnv = utils.getProjectEnv( options )
    var root = Path.join(Editor.Project.path, 'build', options.outputName, 'data');    
    var url = Path.join(root, "main.js");
    let data = Fs.readFileSync(url, "utf8")
    let newStr = inject_script + data;

    Fs.writeFileSync(url, newStr);
    createRemoteAsset(options);
    let platform = options.platform;
    if(platform == "android"){
        let versionName = utils.getProjectVersion(options);
        let versionCode = utils.versionNameToCode(versionName);
        //拷贝模板数据
        let propertiesRoot = Path.join(Editor.Project.path, "build", options.outputName);
        let templatePath = Path.join(Editor.Project.path, 'build-template', options.outputName);
        if(utils.isDirectory(templatePath) && utils.isDirectory(propertiesRoot)){
            utils.copyFolder(templatePath, propertiesRoot);
        }
        let properties = Path.join(Editor.Project.path, "build", options.outputName, "proj/gradle.properties");
        utils.coverFileContent(properties, /#\s*org.gradle.jvmargs=/, 'org.gradle.jvmargs=', true)
        utils.coverFileContent(properties, /PUBLISH_APP_NAME=.*/, 'PUBLISH_APP_NAME='+config.appname, false);
        utils.coverFileContent(properties, /PUBLISH_SIGN_PATH=.*/, 'PUBLISH_SIGN_PATH='+config.signPath, false);
        utils.coverFileContent(properties, /PUBLISH_SIGN_ALIAS=.*/, 'PUBLISH_SIGN_ALIAS='+config.signAlias, false);
        utils.coverFileContent(properties, /PUBLISH_SIGN_PASSWORD=.*/, 'PUBLISH_SIGN_PASSWORD='+config.signPassword, false);
        utils.coverFileContent(properties, /PUBLISH_VERSION_NAME=.*/, 'PUBLISH_VERSION_NAME='+versionName, false);
        utils.coverFileContent(properties, /PUBLISH_VERSION_CODE=\d*/, 'PUBLISH_VERSION_CODE='+versionCode, false);
        utils.coverFileContent(properties, /PUBLISH_ENV_NAME=\w*/, 'PUBLISH_ENV_NAME='+config.ENV_NAME[curEnv], false);
        utils.coverFileContent(properties, /android.useAndroidX=\w*/, 'android.useAndroidX=true', false);
        utils.coverFileContent(properties, /android.enableJetifier=\w*/, 'android.enableJetifier=true', false);
    }
    else if(platform == "ios"){
        //拷贝模板数据
        let propertiesRoot = Path.join(Editor.Project.path, "build", options.outputName);
        let templatePath = Path.join(Editor.Project.path, 'build-template', options.outputName);
        if(utils.isDirectory(templatePath) && utils.isDirectory(propertiesRoot)){
            utils.copyFolder(templatePath, propertiesRoot);
        }

        let cdPath = Path.join(propertiesRoot, "proj");
        const command =  `cd ${cdPath} && pod install`;
        console.log('exec command :', command);
        process.execSync(command);
    }
}