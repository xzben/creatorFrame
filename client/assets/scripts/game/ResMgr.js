let parseLoadResArgs = function(type, onProgress, onComplete) {
    if (onComplete === undefined) {
        var isValidType = cc.js.isChildClassOf(type, cc.Asset);
        if (onProgress) {
            onComplete = onProgress;
            if (isValidType) {
                onProgress = null;
            }
        }
        else if (onProgress === undefined && !isValidType) {
            onComplete = type;
            onProgress = null;
            type = null;
        }
        if (onProgress !== undefined && !isValidType) {
            onProgress = type;
            type = null;
        }
    }
    return { type, onProgress, onComplete };
};

let parseParameters = function (options, onProgress, onComplete) {
    if (onComplete === undefined) {
        var isCallback = typeof options === 'function';
        if (onProgress) {
            onComplete = onProgress;
            if (!isCallback) {
                onProgress = null;
            }
        }
        else if (onProgress === undefined && isCallback) {
            onComplete = options;
            options = null;
            onProgress = null;
        }
        if (onProgress !== undefined && isCallback) {
            onProgress = options;
            options = null;
        }
    }
    options = options || Object.create(null);
    return { options, onProgress, onComplete };
};

var ResMgr = cc.Class({
    name: "ResMgr",
    properties: {
        uiControlList : null,
    },

    ctor(){
    },

    init(){
        // cc.assetManager.downloader.maxRetryCount = 3;        //下载失败重试次数
        // cc.assetManager.downloader.retryInterval = 2000;     //下载失败重试间隔时间单位ms
        // cc.assetManager.downloader.maxConcurrency = 10;      //下载的最大并发连接数量
        // cc.assetManager.downloader.maxRequestsPerFrame = 6;  //每帧最多发起多少下载次数
    },

    _checkLoadBundle(pathName, onProgress, onComplete, doneCallback){
        if(typeof(pathName) === "string"){
            this._checkLoadSignal(pathName, onProgress, onComplete, doneCallback)
        }else{
           this._checkLoadArrs(pathName, onProgress, onComplete, doneCallback)
        }
    },

    _checkLoadArrs(pathName, onProgress, onComplete, doneCallback){
        let bundleNames = []
        let bundleRes = {}
        let bundleCount = 0
        let resCount = 0
        let tempResCache = {}
        pathName.forEach(( path )=>{
            let arr = String(path).split(".")
            let bundleName;
            let resName;

            if(arr.length == 1){
               bundleName = "resources"
               resName = arr[0]
            }else{
                bundleName = arr[0]
                resName = arr[1]
            }
            
            let bundleResNames = bundleRes[bundleName];
            if(bundleResNames == null){
                bundleResNames = [];
                bundleRes[bundleName] = bundleResNames;
                bundleNames.push(bundleName);
                bundleCount++;
            }

            if(tempResCache[path] == null)
            {
                tempResCache[path] = true;
                bundleResNames.push(resName);
                resCount++;
            }
        })

        let maxCount = resCount;
        let finishCount = 0;
        let curFinish = 0;
        let results = [];
        let isFinish = false;
        let tempCache = {}

        let newProcess, newComplete;


        if(onProgress != null){
            newProcess = (finish, totoal, item)=>{
                log.d("########### process", finish, totoal, item)
                if(bundleCount == 1)
                    onProgress(finish, totoal, item)
                else{
                    onProgress(curFinish, maxCount, item)
                }
            };
        }
       
        if(onComplete != null){
            newComplete = (err, items)=>{
                finishCount++;
                if(isFinish) return;

                if(err){
                    isFinish = true;
                    onComplete(err, null)
                    return;
                }

                results.push(items);

                if(finishCount >= bundleCount){
                    isFinish = true;
                    return onComplete(null, results)
                }
            };
        }
        

        bundleNames.forEach((bundleName)=>{
            let bundle = cc.assetManager.getBundle(bundleName);
            if( bundle == null){
                this.loadBundle(bundleName, (err, asset)=>{
                    doneCallback(null, bundleRes[bundleName], asset, newProcess, newComplete);
                })
            }else{
                doneCallback(null, bundleRes[bundleName], bundle, newProcess, newComplete);
            }
        })
    },

    _checkLoadSignal(pathName, onProgress, onComplete, doneCallback){
        let arr = String(pathName).split(".")
        if(arr.length == 1){
            doneCallback(null, arr[0], cc.resources, onProgress, onComplete)
        }else{
            let bundleName = arr[0];
            let path = arr[1]
            let bundle = cc.assetManager.getBundle(bundleName);
            if( bundle == null){
                this.loadBundle(bundleName, (err, asset)=>{
                    bundle = asset
                    doneCallback(err, path, bundle, onProgress, onComplete)
                })
            }else{
                doneCallback(null, path, bundle, onProgress, onComplete)
            }
        }
    },

    loadScene(paths, options, onProgress, onComplete){
        var { options, onProgress, onComplete } = parseParameters(options, onProgress, onComplete);
        this._checkLoadBundle(paths, onProgress, onComplete,  (err, resPath, bundle, newProcess, newComplete)=>{
            this.loadSceneFromBundle(bundle, resPath, options, newProcess, newComplete);
        })
    },
    load(paths, type, onProgress, onComplete){
        var { type, onProgress, onComplete } = parseLoadResArgs(type, onProgress, onComplete)
        this._checkLoadBundle(paths, onProgress, onComplete,  (err, resPath, bundle, newProcess, newComplete)=>{
            this.loadFromBundle(bundle, resPath, type, newProcess, newComplete);
        })
    },

    loadDir(dir, type, onProgress, onComplete){
        var { type, onProgress, onComplete } = parseLoadResArgs(type, onProgress, onComplete)
        this._checkLoadBundle(dir, onProgress, onComplete,  (err, resPath, bundle, newProcess, newComplete)=>{
            this.loadDirFromBundle(bundle, resPath, type, newProcess, newComplete);
        })
    },

    preload(paths, type, onProgress, onComplete){
        var { type, onProgress, onComplete } = parseLoadResArgs(type, onProgress, onComplete)
        this._checkLoadBundle(paths, onProgress, onComplete,  (err, resPath, bundle, newProcess, newComplete)=>{
            this.preloadFromBundle(bundle, resPath, type, newProcess, newComplete);
        });
    },

    preloadScene(paths, options, onProgress, onComplete){
        var { options, onProgress, onComplete } = parseParameters(options, onProgress, onComplete);
        this._checkLoadBundle(paths, onProgress, onComplete,  (err, resPath, bundle, newProcess, newComplete)=>{
            this.preloadSceneFromBundle(bundle, resPath, options, newProcess, newComplete);
        });
    },

    proloadDir(dir, type, onProgress, onComplete){
        var { type, onProgress, onComplete } = parseLoadResArgs(type, onProgress, onComplete)
        this._checkLoadBundle(dir, onProgress, onComplete,  (err, resPath, bundle, newProcess, newComplete)=>{
            this.preloadDirFromBundle(bundle, resPath, type, newProcess, newComplete);
        });
    },

    release( path, type){
        let arr = String(path).split(".")
        if(arr.length == 1){
            this.releaseFromBundle(cc.resources, arr[0], type);
        }else{
            let bundleName = arr[0];
            let path = arr[1]
            let bundle = cc.assetManager.getBundle(bundleName);
            if( bundle != null){
                this.releaseFromBundle(bundle, path, type);
            }
        }
    },

    clearBundle( bundleName ){
        let bundle = cc.assetManager.getBundle(bundleName);
        bundle.releaseAll();
        cc.assetManager.removeBundle(bundle);
    },

    releaseAsset( asset ){
        cc.assetManager.releaseAsset(asset);
    },

    loadBundle( path, options, onComplete){
        cc.assetManager.loadBundle(path, options, onComplete);
    },

    loadFromBundle(bundle, path, type, onProcess, onComplete){
        bundle.load(path, type, onProcess, onComplete);
    },

    loadSceneFromBundle(bundle, path, options, onProcess, onComplete){
        bundle.loadScene(path, options, onProcess, onComplete);
    },

    loadDirFromBundle(bundle, dir, type, onProcess, onComplete){
        bundle.loadDir(dir, type, onProcess, onComplete);
    },

    preloadFromBundle(bundle, path, type, onProcess, onComplete){
        bundle.preload(path, type, onProcess, onComplete)
    },

    preloadSceneFromBundle(bundle, path, options, onProcess, onComplete){
        bundle.preloadScene(path, options, onProcess, onComplete)
    },

    preloadDirFromBundle(bundle, dir, type, onProcess, onComplete){
        bundle.preloadDir(dir, type, onProcess, onComplete);
    },

    releaseFromBundle(bundle, path, type){
        bundle.release(path, type);
    },
});

 module.exports = frame.InstanceMgr.createInstance(ResMgr);;