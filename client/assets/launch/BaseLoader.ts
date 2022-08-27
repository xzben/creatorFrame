import * as cc from "cc"

const { ccclass } = cc._decorator;

type Bundle = cc.AssetManager.Bundle;
type AssetType = typeof cc.Asset;

export class ResItem {
    private m_refCount = 0;
    private m_path : string;

    constructor( path : string ){
        this.m_path = path;
    }

    public getPath() : string{
        return this.m_path;
    }

    public getRefCount() : number{
        return this.m_refCount;
    }

    public addRef(){
        this.m_refCount++;
    }

    public decRef(){
        this.m_refCount--;
        if(this.m_refCount <= 0){
            this.destroy();
        }
    }

    protected destroy(){

    }
}

export class BundleAsset extends ResItem{
    private m_bundle : Bundle;

    constructor( nameOrUrl : string, bundle : Bundle){
        super(nameOrUrl);
        this.m_bundle = bundle;
    }

    public getBundle() : Bundle{
        return this.m_bundle;
    }

    protected destroy(){
        BaseLoader.removeBundle(this.getPath());
    }
}

export class NormalAsset extends ResItem {
    private m_asset : cc.Asset;
    private m_bundle : BundleAsset;

    constructor( path : string, asset : cc.Asset, bundle : BundleAsset){
        super(path);
        this.m_bundle = bundle;
        bundle.addRef();
        asset.addRef();
        this.m_asset = asset;
    }

    public getAsset() : cc.Asset{
        return this.m_asset;
    }

    protected destroy(){
        this.m_asset.decRef();
        this.m_bundle.decRef();
    }
}



export type OptionType = Record<string, any>;
export type LoadBundleAssetCompleteFunc = (err: Error | null, bundle : BundleAsset | null) => void;
export type LoadBundleAssetProcessFunc = (percent : number) => void;

export type LoadBundleArrayAssetCompleteFunc = (err: Error | null, bundle : Map<string,BundleAsset> | null) => void;
export type LoadBundleArrayAssetProcessFunc = (percent : number) => void;

export type LoadAssetProcessFunc = (percent : number) => void;
export type LoadAssetCompleteFunc = (error: Error | null, assets: cc.Asset | cc.Asset[] | null | any) => void;
export type PreloadAssetCompleteFunc = (error : Error | null, items : cc.AssetManager.RequestItem[] | null | any)=>void;
export type LoadBundleDoneCallback = (error : Error | null, resPath : string, bundle : BundleAsset | null )=>void;
export type LoadPrefabCompnent = ( node : cc.Node)=>void;

let AssetTypeMap : any = {
    "mp3"    : cc.AudioClip,
    "prefab" : cc.Prefab,
    "scene"  : cc.Scene,
    "proto"  : cc.TextAsset,
    "png"    : cc.SpriteFrame,
    "jpg"    : cc.SpriteFrame,
}

function removeSuffix( path : string) : string{
    let idx = path.lastIndexOf(".");
    if(idx != -1){
        return path.substring(0, idx);
    }

    return path;
}

function getSuffix( path : string) : string{
    let idx = path.lastIndexOf(".");
    if(idx != -1){
        return path.substr(idx+1);
    }

    return path;
}

@ccclass("BaseLoader")
export class BaseLoader{
    protected static m_loadedBundle : Map<string, BundleAsset> = new Map;
    protected static m_bundleVersions : Map<string, string> = null!;


    public static getBundleVersions( bundleName : string) : string | undefined{
        if(this.m_bundleVersions == null) return undefined;
        
        return this.m_bundleVersions.get(bundleName);
    }

    //删除bundle
    public static removeBundle( nameOrUrl : string ){
        let asset = this.m_loadedBundle.get(nameOrUrl);
        if(asset){
            this.m_loadedBundle.delete(nameOrUrl);
            if(nameOrUrl != "resources")
                cc.assetManager.removeBundle(asset.getBundle());
        }
    }

    public static loadBundleArray( names : string[], onComplete : LoadBundleArrayAssetCompleteFunc, onProgress ?: LoadBundleAssetProcessFunc){
        let size = names.length;
        let count = size;
        let isDone = false;

        let bundles : Map<string,BundleAsset> = new Map();
        let check_done = ( err : Error | null, url : string, bundle : BundleAsset | null)=>{
            if(isDone) return;
            if(err == null && bundle != null){
                bundles.set(url, bundle);
                count --;
                if(count <= 0){
                    isDone = true;
                    onComplete(null, bundles );
                }
            }else{
                isDone = true;
                onComplete(err, null);
            }
        }

        let filePercents : Map<string, number> = new Map();
        let onePercent = 1/size;
        let updatePorcess = ( bundleUrl : string, percent : number)=>{
            if(onProgress != null){
                filePercents.set(bundleUrl, percent);
                let allpercent = 0;
                filePercents.forEach(( p : number)=>{
                    allpercent += onePercent*p;
                })
                onProgress(allpercent);
            }
        }

        for(let i = 0; i < size; i++){
            let bundleUrl = names[i]
            filePercents.set(bundleUrl, 0);
            this.loadBundle(bundleUrl, ( err : Error | null, bundle)=>{
                check_done(err, bundleUrl, bundle);
            }, (percent : number)=>{
                updatePorcess(bundleUrl, percent);
            })
        }
    }

    //加载bundle
    public static loadBundle( nameOrUrl : string, onComplete : LoadBundleAssetCompleteFunc, onprogress ?: LoadBundleAssetProcessFunc){
        let asset = this.m_loadedBundle.get(nameOrUrl);
        if(asset){
            onprogress && onprogress(1);
            onComplete(null, asset);
        }else{
            if(nameOrUrl == "resources"){
                let asset = new BundleAsset(nameOrUrl, cc.resources);
                this.m_loadedBundle.set(nameOrUrl, asset);
                onprogress && onprogress(1);
                onComplete(null, asset);
            }else{
                let options : any = {}
                if(onprogress){
                    options.onFileProgress = (loaded: number, total: number)=>{
                        onprogress(loaded/total);
                    }
                }
                let version = this.getBundleVersions(nameOrUrl)
                if(version){
                    options.version = version;
                    cc.assetManager.loadBundle(nameOrUrl, options, (err: Error | null, data: Bundle)=>{
                        if(err == null){
                            /** 防止同时调用 loadBundle 多次造成创建多个 BundleAsset */
                            let asset = this.m_loadedBundle.get(nameOrUrl);
                            if(!asset) {
                                asset = new BundleAsset(nameOrUrl, data);
                                this.m_loadedBundle.set(nameOrUrl, asset);
                            }
                            onComplete(null, asset);
                        }else{
                            onComplete(err, null);
                        }
                    });
                }else{
                    cc.assetManager.loadBundle(nameOrUrl, options, (err: Error | null, data: Bundle)=>{
                        if(err == null){
                            /** 防止同时调用 loadBundle 多次造成创建多个 BundleAsset */
                            let asset = this.m_loadedBundle.get(nameOrUrl);
                            if(!asset) {
                                asset = new BundleAsset(nameOrUrl, data);
                                this.m_loadedBundle.set(nameOrUrl, asset);
                            }
                            onComplete(null, asset);
                        }else{
                            onComplete(err, null);
                        }
                    });
                }
                
            }
        }
    }

    protected m_loadedAssets : Map<string, NormalAsset> = new Map;
    protected m_stackLoadedAssets : Array<Map<string, NormalAsset>> = new Array;

    public releaseAsset( path : string){
        let asset = this.m_loadedAssets.get(path);
        if(asset){
            asset.decRef();
            if(asset.getRefCount() <= 0)
            {
                this.m_loadedAssets.delete(path);
            }
        }
    }

    public pushStackAssets(){
        this.m_stackLoadedAssets.push(this.m_loadedAssets);
        this.m_loadedAssets = new Map();
    }

    public popReleaseStackAssets(){
        if(this.m_stackLoadedAssets.length < 1)return;

        let assets = this.m_stackLoadedAssets.pop();
        assets?.forEach((asset : NormalAsset)=>{
            asset.getAsset().decRef();
        })
        assets?.clear();
    }

    public releaseAll(){
        this.m_loadedAssets.forEach(( asset : NormalAsset)=>{
            asset.getAsset().decRef();
        })
        this.m_loadedAssets.clear();
    }

    public loadPrefab( path : string, onComplete : LoadAssetCompleteFunc, onprogress ?: LoadBundleAssetProcessFunc){
        this.load(path, cc.Prefab, onComplete, onprogress);
    }

    public loadMaterail( path : string, onComplete : LoadAssetCompleteFunc, onprogress ?: LoadBundleAssetProcessFunc){
        this.load(path, cc.Material, onComplete, onprogress);
    }
    
    public loadPrefabNode( path : string, onComplete : LoadPrefabCompnent, onprogress ?: LoadBundleAssetProcessFunc){
        this.loadPrefab(path, (success, prefab : cc.Prefab)=>{
            if(prefab){
                onComplete(cc.instantiate(prefab));
            }else{
                onComplete(null!);
            }
        }, onprogress)
    }

    public loadAudioClip(path : string, onComplete: LoadAssetCompleteFunc, onprogress ?: LoadBundleAssetProcessFunc){
        this.load(path, cc.AudioClip, onComplete, onprogress);
    }

    public loadAnimClip( path : string, onComplete: LoadAssetCompleteFunc, onprogress ?: LoadBundleAssetProcessFunc ){
        this.load(path, cc.AnimationClip, onComplete, onprogress);
    }
    
    public loadTexture2D( path : string, onComplete : LoadAssetCompleteFunc, onprogress ?: LoadBundleAssetProcessFunc){
        this.load(path, cc.Texture2D, onComplete, onprogress);
    }

    public loadSpriteFrame( path : string, onComplete : LoadAssetCompleteFunc, onprogress ?: LoadBundleAssetProcessFunc){
        path = removeSuffix(path);
        if(path[path.length-1] != "/"){
            path += "/";
        }
        path += "spriteFrame"
        this.load(path, cc.SpriteFrame, onComplete, onprogress);
    }

    public loadSpriteAtlas( path : string, onComplete : LoadAssetCompleteFunc, onprogress ?: LoadBundleAssetProcessFunc){
        this.load(path, cc.SpriteAtlas, onComplete, onprogress);
    }

    public loadTextAsset( path : string, onComplete : LoadAssetCompleteFunc, onprogress ?: LoadBundleAssetProcessFunc){
        this.load(path, cc.TextAsset, onComplete, onprogress);
    }

    public LoadJsonAsset( path : string, onComplete : LoadAssetCompleteFunc, onProgress : LoadAssetProcessFunc | null = null){
        this.load(path, cc.JsonAsset, onComplete, onProgress);
    }

    public LoadAsset( path : string, onComplete : LoadAssetCompleteFunc, onProgress : LoadAssetProcessFunc | null = null){
        this.load(path, cc.Asset, onComplete, onProgress);
    }

    private parsePath( path : string ) : any{
        let arr = path.split("#");
        let bundleName = "resources";
        let resName = "";
        let assetType : AssetType | null = null;

        if( arr.length == 1){
            bundleName = "resources";
            resName = arr[0];
        }else if(arr.length  == 2){
            bundleName = arr[0];
            resName = arr[1];
        }else if(arr.length > 2){
            console.error("errror path get get BundleName"+ path);
            return null;
        }

        let itemArr = resName.split(".")
        if(itemArr.length == 2 && AssetTypeMap[itemArr[1]]){
            resName = itemArr[0];
            assetType = AssetTypeMap[itemArr[1]] as AssetType;
        }else{
            console.error("error path to get Asset Type" + path);
            return null;
        }

        return { bundleName : bundleName, resName : resName, assetType : assetType }
    }

    public loadArray( paths : string[], onComplete : LoadAssetCompleteFunc, onProgress : LoadAssetProcessFunc | null = null){
        let totoal = paths.length;
        let finished = 0;
        let assets : cc.Asset[] = [];
        let isError = false;

        paths.forEach(( path : string )=>{
            if(isError)return;

            let assetType = null;
            let resName = path;
            let arr = path.split(".")
            if(arr.length == 2 && AssetTypeMap[arr[1]]){
                resName = arr[0];
                assetType = AssetTypeMap[arr[1]] as AssetType;
            }
            this.load(resName, assetType, ( err : Error | null, data : cc.Asset)=>{
                if(err == null && data){
                    assets.push(data);
                    finished++;
                    if(finished < totoal){
                        onProgress && onProgress(finished/totoal);
                    }else{
                        onComplete( null, assets);
                    }
                }else{
                    isError = true;
                    onComplete(err, null);
                    return;
                }
            })
        })
    }

    private load(path : string, type : AssetType | null, onComplete : LoadAssetCompleteFunc, onProgress : LoadAssetProcessFunc | null = null){
        path = removeSuffix(path);
        let asset = this.m_loadedAssets.get(path);
        if(asset){
            asset.addRef();
            onComplete(null, asset.getAsset());
        }else{
            let bundleBase = 0.5;
            this.checkLoadBundle(path, ( err : Error | null, resPath : string, bundle : BundleAsset | null)=>{
                if( err || bundle == null ){
                    onComplete( err || new Error("load bundle" + path +" failed"), null);
                }else{
                    if(type == null){
                        bundle.getBundle().load(resPath, (finished: number, total: number, item: cc.AssetManager.RequestItem)=>{
                            if( onProgress )
                                onProgress(bundleBase+finished/total);
                        },(err, obj : cc.Asset)=>{
                            if( err == null && obj){
                                /** 防止同时调用 load 多次造成创建多个 NormalAsset */
                                let asset = this.m_loadedAssets.get(path);
                                if(!asset) {
                                    asset = new NormalAsset(path, obj, bundle);
                                    this.m_loadedAssets.set(path, asset);
                                }
                                asset.addRef();
                                onComplete(null, asset.getAsset());
                            }else{
                                onComplete(err || new Error("load asset" + path+ "failed"), null);
                            }
                        })
                    }else{
                        bundle.getBundle().load(resPath, type, (finished: number, total: number, item: cc.AssetManager.RequestItem)=>{
                            if( onProgress )
                                onProgress(bundleBase+finished/total);
                        },(err, obj : cc.Asset)=>{
                            if( err == null && obj){
                                /** 防止同时调用 load 多次造成创建多个 NormalAsset */
                                let asset = this.m_loadedAssets.get(path);
                                if(!asset) {
                                    asset = new NormalAsset(path, obj, bundle);
                                    this.m_loadedAssets.set(path, asset);
                                }
                                asset.addRef();
                                onComplete(null, asset.getAsset());
                            }else{
                                onComplete(err || new Error("load asset" + path+ "failed"), null);
                            }
                        })
                    }
                }
            }, ( percent : number)=>{
                onProgress && onProgress(percent*bundleBase);
            })
        }
    }

    private checkLoadBundle(pathName : string, onComplete : LoadBundleDoneCallback, onprogress ?: LoadBundleAssetProcessFunc){
        let arr = pathName.split("#")
        // console.log("checkLoadBundle", pathName, arr);
        
        let bundleName = "";
        let path = "";

        if(arr.length == 1){ //代表内嵌bundle的资源
            bundleName = "resources";
            path = arr[0];
        }else if(arr.length == 2){
            bundleName = arr[0];
            path = arr[1]
        }else{
            console.error("errror pathName:"+pathName);
            return;
        }

        BaseLoader.loadBundle(bundleName, ( err: Error | null, bundle : BundleAsset | null)=>{
            if( err || bundle == null){
                onComplete( err || new Error("load bundle failed"), path, null);
            }else{
                onComplete( err, path, bundle);
            }
        }, onprogress)
    }

    public loadScene(path : string, onComplete : LoadAssetCompleteFunc, onProgress : LoadAssetProcessFunc | null = null){
        this.checkLoadBundle(path, (error : Error | null, resPath : string, bundle : BundleAsset | null )=>{
            if(error == null && bundle){
                bundle.getBundle().loadScene(resPath, ( finish : number, totoal : number)=>{
                    onProgress && onProgress(finish/totoal);
                }, (err : Error | null, obj : cc.SceneAsset)=>{
                    if(err == null && obj){
                        let asset = new NormalAsset(path, obj, bundle);
                        asset.addRef();
                        this.m_loadedAssets.set(path, asset);
                    }
                    onComplete(err, obj);
                });
            }else{
                onComplete(error, bundle);
            }
        });
    }
}