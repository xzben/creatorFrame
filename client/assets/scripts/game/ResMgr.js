var ResMgr = cc.Class({
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

    _checkLoadBundle( pathName, donCallback){
        log.d("###############_checkLoadBundle ############## ")
        let arr = String(pathName).split(".")
        if(arr.length == 1){
            donCallback(null, arr[0], cc.resources)
        }else{
            let bundleName = arr[0];
            let path = arr[1]
            let bundle = cc.assetManager.getBundle(bundleName);
            if( bundle == null){
                this.loadBundle(bundleName, (err, asset)=>{
                    bundle = asset
                    donCallback(err, path, bundle)
                })
            }else{
                donCallback(null, path, bundle)
            }
        }
    },

    loadScene(paths, options, onProcess, onComplete){
        this._checkLoadBundle(paths, (err, resPath, bundle)=>{
            this.loadSceneFromBundle(bundle, resPath, options, onProcess, onComplete);
        })
    },
    load(paths, type, onProcess, onComplete){
        this._checkLoadBundle(paths, (err, resPath, bundle)=>{
            log.d("################ load", bundle, resPath)
            this.loadFromBundle(bundle, resPath, type, onProcess, onComplete);
        })
    },

    loadDir(dir, type, onProcess, onComplete){
        this._checkLoadBundle(dir, (err, resPath, bundle)=>{
            this.loadDirFromBundle(bundle, resPath, type, onProcess, onComplete);
        })
    },

    preload(paths, type, onProcess, onComplete){
        this._checkLoadBundle(paths, (err, resPath, bundle)=>{
            this.preloadFromBundle(bundle, resPath, type, onProcess, onComplete);
        });
    },

    preloadScene(paths, options, onProcess, onComplete){
        this._checkLoadBundle(paths, (err, resPath, bundle)=>{
            this.preloadSceneFromBundle(bundle, resPath, options, onProcess, onComplete);
        });
    },

    proloadDir(dir, type, onProcess, onComplete){
        this._checkLoadBundle(paths, (err, resPath, bundle)=>{
            this.preloadDirFromBundle(bundle, resPath, type, onProcess, onComplete);
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