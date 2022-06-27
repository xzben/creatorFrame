
'use strict';

var Fs = require("fs");
var Path = require("path");
var Crypto = require('crypto');

var utils = {}

utils.getProjectEnv = function( options ){
    let lauchPath = Path.join(Editor.Project.path, 'assets/launch.scene');    
    let data = Fs.readFileSync(lauchPath, "utf8")
    let newdata = data.match(/"m_gameEnv"\s*:\s*(\d*)/i);
    console.log("getProjectEnv", newdata);
    let curEnv = parseInt(newdata[1]);

    return curEnv
}

utils.getProjectVersion = function( options ){
    let destManifest = Path.join(Editor.Project.path, "assets/resources/", 'version.json');
    let data = Fs.readFileSync(destManifest, "utf8")
    let projectData = JSON.parse(data);

    console.log("getProjectVersion", projectData.version)
    return projectData.version
}


utils.readDir = function (dir, root, obj) {
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
            utils.readDir(subpath, root, obj);
        }
        else if (stat.isFile()) {
            console.log("record file", subpath)
            // Size in Bytes
            size = stat['size'];
            md5 = Crypto.createHash('md5').update(Fs.readFileSync(subpath)).digest('hex');
            compressed = Path.extname(subpath).toLowerCase() === '.zip';
            
            relative = Path.relative(root, subpath);
            relative = relative.replace(/\\/g, '/');
            relative = encodeURI(relative);
            obj[relative] = {
                'size' : size,
                'md5' : md5
            };
            if (compressed) {
                obj[relative].compressed = true;
            }
        }
    }
}

//拷贝目录文件
utils.copyFolder = function(sourceDir, destDir) {
    var stat = Fs.statSync(sourceDir);
    if (!stat.isDirectory()) {
        return;
    }

    if(!Fs.existsSync(destDir)){
        Fs.mkdirSync(destDir, {recursive: true});
    }
    
    var subpaths = Fs.readdirSync(sourceDir), subpath;
    for (var i = 0; i < subpaths.length; ++i) {
        if (subpaths[i][0] === '.') {
            continue;
        }
        subpath = Path.join(sourceDir, subpaths[i]);
        stat = Fs.statSync(subpath);
        if (stat.isDirectory()) {
            let tempDir = Path.join(destDir, subpaths[i]);
            if(!Fs.existsSync(tempDir)){
                Fs.mkdirSync(tempDir);
            }
            utils.copyFolder(subpath, tempDir);
        }
        else if (stat.isFile()) {
            Fs.copyFileSync(subpath, Path.join(destDir, subpaths[i]));
        }
    }
}


//拷贝文件
utils.copyFile = function(sourceFile, destFile) {
    if(!utils.isFile(sourceFile)){
        return;
    }
    Fs.copyFileSync(sourceFile, destFile);
}

//格式化时间
utils.dateFormat = function(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

//判断是否是目录
utils.isDirectory = function(fileName) {
    if (Fs.existsSync(fileName)) return Fs.statSync(fileName).isDirectory();
}

//判断是否是文件
utils.isFile = function(fileName) {
    if (Fs.existsSync(fileName)) return Fs.statSync(fileName).isFile();
}
 

//截取路径的文件名
utils.getFileName = function(filePath){
    var pos1 = filePath.lastIndexOf('/');
    var pos2 = filePath.lastIndexOf('\\');
    var pos = Math.max(pos1, pos2)
    if( pos<0 )
        return filePath;
    else
        return filePath.substring(pos+1);
}

//模糊查找路径下的文件
utils.findFileByDir = function( directory, name){
    let checkPath = ''
    let filenames = Fs.readdirSync(directory);
    filenames.forEach(function(filename){ 
        if (filename.search(name) != -1) {
            checkPath = directory + "/" + filename;
        }
    }); 
    return checkPath
}

//只替换文件内容
utils.replaceFileContent = function(filePath, re, replaceValue){
    if(Fs.existsSync(filePath)){
        let data = Fs.readFileSync(filePath, "utf8")
        if (data.search(re) != -1) {
            let newdata = data.replace(re, replaceValue);
            Fs.writeFileSync(filePath, newdata);
            return true;
        }
    }
    return false;
}

//文件内容存在替换，不存在写入
utils.coverFileContent = function(filePath, re, replaceValue, onlyReplace){
    let dirPath = Path.dirname(filePath)
    if(!Fs.existsSync(dirPath)){
        Fs.mkdirSync(dirPath, {recursive: true})//递归创建
    }

    if(!utils.isFile(filePath) && !onlyReplace){
        Fs.writeFileSync(filePath, replaceValue);
    }else{
        let data = Fs.readFileSync(filePath, "utf8")
        if (data.search(re) != -1) {
            let newdata = data.replace(re, replaceValue);
            Fs.writeFileSync(filePath, newdata);
        }else if(!onlyReplace){
            Fs.writeFileSync(filePath, data + '\n'+replaceValue);
        } 
    } 
}

//文件最前面插入内容
utils.insertFileFrontData = function(filePath, content){
    if(utils.isFile(filePath)){
        var data = Fs.readFileSync(filePath);
        let fd = Fs.openSync(filePath, 'w+')
        var buffer = new Buffer(content);
        Fs.writeSync(fd, content, 0, buffer.length, 0);
        Fs.writeSync(fd, data, 0, data.length, buffer.length);
        Fs.close(fd);
    }
}

//版本name转版本code    
utils.versionNameToCode = function( versionName ){
    let code = 0;
    let v = versionName.split(".");
    let bit = 100
    for(let i = 0; i < v.length; i++){
        let temp = parseInt(v[i]);
        if(i == v.length - 1){
            bit = 1000;
        }
        code = code * bit + temp;
    }
    return code;
}

module.exports = utils;
