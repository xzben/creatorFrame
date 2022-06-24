
import * as cc from 'cc';
import { GameWorld, GlobalEvent } from '../../world/GameWorld';
import { getGameControlRootUrl } from '../../config/NetworkConfig';
import { PlatformType } from '../../config/PlatformConfig';
import { log } from "../log/log"
import { Network } from '../net/Network';
import { platform } from '../platform/platform';
import { HttpUtils } from '../utils/util/HttpUtils';
import { utils } from '../utils/utils';
const { ccclass, property } = cc._decorator;

export type CHECK_UPDATE_CALLBACK = ( needUpdate : boolean, code : number, msg : string)=>void;
export type UPDATE_PROCESS_CALLBACK = ( percent : number, finish : number, totoal : number)=>void;
export type UPDATE_FINISH_CALLBACK = ( success : boolean, code : number, msg : string)=>void;


const VERSION_KEY               = "version";
const PACKAGE_URL_KEY           = "packageUrl"
const REMOTE_MANIFEST_URL_KEY   = "remoteManifestUrl";
const REMOTE_VERSION_URL_KEY    = "remoteVersionUrl";

const PlatformName : any = {
    [PlatformType.WIN32] : "android",
    [PlatformType.Android] : "android",
    [PlatformType.IOS] : "ios",
    [PlatformType.H5] : "h5",
    [PlatformType.Web] : "web",
    [PlatformType.QUICK] : "quick",
}

type SERVER_CONFIG = {
    shenheversion : string,
    shenheserver : string,
    version : string,
    updateTips : string,
    updateUrl : string,
    shares : any,
}

@ccclass('UpdateManager')
export class UpdateManager extends cc.Component {
    private m_storagePath = "";
    private m_assetManager : jsb.AssetsManager = null!;
    @property(cc.JsonAsset)
    private m_manifestJsonUrl  : cc.JsonAsset = null!;

    private m_manifestUrl  : string = null!;

    private m_updating     : boolean = false;
    private m_assetData    : any = null;
    private static s_instance : UpdateManager = null!

    private m_serverConfig : SERVER_CONFIG = null!;
    private m_isShenHeStatus : boolean = false;

    public static getInstance():UpdateManager{
        return this.s_instance;
    }

    onLoad(){
        UpdateManager.s_instance = this;
        GameWorld.getInstance().addListener(GlobalEvent.INIT_UPDATE_MANIFEST, this, this.handleInitManifest)
        this.m_assetData = this.m_manifestJsonUrl.json;
    }

    handleInitManifest( asset : cc.Asset){
        console.log("handleInitManifest", asset, asset.nativeUrl);
        this.m_manifestUrl = asset.nativeUrl;
        this.onInit();
    }

    public getLocalVersion() : string{
        return this.m_assetData[VERSION_KEY];
    }
    
    public onInit(){
        if(!cc.sys.isNative){
            return;
        }
        
        this.m_storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'updateContent');
        log.d("storage path for remote asset : ", this.m_storagePath);

        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        // 自定义版本检测接口
        this.m_assetManager = new jsb.AssetsManager("", this.m_storagePath, ( versionA : string, versionB : string) : number =>{
            log.d("Js custom version compare : version A is :"+versionA + ", version B is "+ versionB);
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
        });

        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        // 更新文件校验检测
        this.m_assetManager.setVerifyCallback(function (path: string, asset: any) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                log.d("Verification passed : " + relativePath);
                return true;
            }
            else {
                log.d("Verification passed : " + relativePath + ' (' + expectedMD5 + ')');
                return true;
            }
        });
        log.d("nativeUrl : " + this.m_manifestUrl);
        this.m_assetManager.loadLocalManifest(this.m_manifestUrl);
    }

    private updateServerConfig(){
        let shenheVersion = this.m_serverConfig.shenheversion;
        if( typeof(shenheVersion) == "string" && utils.versionCmp(shenheVersion, this.getLocalVersion()) == 0){
            this.m_isShenHeStatus = true;
        }else{
            this.m_isShenHeStatus = false;
        }

        if(this.m_isShenHeStatus){
            let shenheserver = this.m_serverConfig.shenheserver;
            if(shenheserver != null){
                Network.getInstance().resetServerUrls([ shenheserver ]);
            }
        }
    }

    private tryGetServerConfig( doneCallback : ( success : boolean)=>void){
        let rootUrl = getGameControlRootUrl();
        let channel = platform.getInstance().getChannel();
        let plat = platform.getInstance().getPlatform();
        let platName = PlatformName[plat] || '';
        utils.LoadingView.show("获取服务器资源配置信息!");
        let controlUrl = rootUrl+"/"+platName+"_"+channel+".json?random="+utils.timeus();
        console.log("tryGetServerConfig begin!")
        HttpUtils.httpGet(controlUrl, ( data : any )=>{
            utils.LoadingView.close();
            try{
                this.m_serverConfig = JSON.parse(data);
                console.log("data", data, "\"", typeof(data), "\"")
                this.updateServerConfig();
                doneCallback(true);
            }catch{
                console.error("##################", controlUrl)
                utils.MsgBox.showConfirm("网络异常读取游戏配置失败,点击确定重试!", ()=>{
                    this.tryGetServerConfig(doneCallback);
                })
            }
        })
    }

    private checkResUpdate(){
        if(!cc.sys.isNative){
            GameWorld.getInstance().dispatch(GlobalEvent.UPDATE_FINISH);
            return;
        }
        utils.LoadingView.show("检测游戏版本信息")
        this.docheckUpdate((needUpdate : boolean, code : number, msg : string)=>{
            utils.LoadingView.close();
            if(needUpdate){
                utils.MsgBox.showConfirmCancel("发现更新，是否更新", ()=>{
                    this.doUpdate(( success : boolean, code : number, msg : string)=>{
                        if(success){
                            utils.MsgBox.showConfirm("更新完成", ()=>{
                                this.restartGame();
                            })
                        }else{
                            GameWorld.getInstance().dispatch(GlobalEvent.UPDATE_ERROR, code, msg);
                        }
                    }, ( percent : number, finish : number, total : number)=>{
                        GameWorld.getInstance().dispatch(GlobalEvent.UPDATE_PROCESS, percent, finish, total);
                    });
                });
            }else{
                GameWorld.getInstance().dispatch(GlobalEvent.UPDATE_FINISH);
            }
        })
    }

    private checkFullUpdate(){
        let localFullVersion = platform.getInstance().getAppVersionName();
        let serverVersion = this.m_serverConfig.version;

        if(utils.versionCmp(serverVersion, localFullVersion) > 0){
            utils.MsgBox.showConfirm(this.m_serverConfig.updateTips || "发现新版本点击确定前往下载!", ()=>{
                platform.getInstance().openUrl(this.m_serverConfig.updateUrl);
            }, false)

            return true;
        }

        return false;
    }

    public getConfigProperty( name : string){
        let config : any = this.m_serverConfig;
        return config[name];
    }

    public checkUpdate(){
        let platformType = platform.getInstance().getPlatform();
        if(platformType == PlatformType.WIN32 || platformType == PlatformType.Web){
            //不需要检测更新
            GameWorld.getInstance().dispatch(GlobalEvent.UPDATE_FINISH);
        }else if(platformType == PlatformType.Android || platformType == PlatformType.IOS){
            //检测原始平台更新
            this.tryGetServerConfig(( success : boolean)=>{
                if(!this.checkFullUpdate()){
                    this.checkResUpdate();
                }
            })
        }else if(platformType == PlatformType.H5 || platformType == PlatformType.QUICK){
            platform.getInstance().onCheckUpdate((isNeedUpdate : boolean)=>{
                if (!isNeedUpdate) {
                    this.tryGetServerConfig(( success : boolean)=>{
                        GameWorld.getInstance().dispatch(GlobalEvent.UPDATE_FINISH);
                    })
                }
            })
        }
    }

    private docheckUpdate( donceCallback : CHECK_UPDATE_CALLBACK){
        if(!cc.sys.isNative) return;

        if(this.m_updating)
        {
            donceCallback(false, -1, "updateing");
            return;
        }

        if(this.m_assetManager.getState() === jsb.AssetsManager.State.UNINITED ){
            this.m_assetManager.loadLocalManifest(this.m_manifestUrl);
        }

        //加载本地manifest 失败
        if(!this.m_assetManager.getLocalManifest() || !this.m_assetManager.getLocalManifest().isLoaded()){
            donceCallback(false, jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST, "No local manifest file found, hot update skipped.");
            return;
        }
        
        this.m_assetManager.setEventCallback(( event : any)=>{
            let code = event.getEventCode();
            log.d("checkupdate Code"+ code);
            let needUpdate = false;
            let msg = "";
            switch(code){
                case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                    {
                        msg = "No local manifest file found, hot update skipped."
                        break;
                    }
                case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                    {
                        msg = "Fail to download manifest file, hot update skipped.";
                        break;
                    }
                case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                    {
                        msg = "Already up to date with the latest remote version.";
                        break;
                    }
                case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                    {
                        msg = 'New version found, please try to update. (' + Math.ceil(this.m_assetManager.getTotalBytes() / 1024) + 'kb)';
                        needUpdate = true;
                        break;
                    }
                default:
                    {
                        return;
                    }
            }

            log.d(msg);
            this.m_assetManager.setEventCallback(null!);
            this.m_updating = false;
            donceCallback(needUpdate, code, msg);
        })
        this.m_updating = true;
        this.m_assetManager.checkUpdate();
    }

    private doUpdate( donceCallback : UPDATE_FINISH_CALLBACK, processCallback ?: UPDATE_PROCESS_CALLBACK){
        if(!cc.sys.isNative) return;
        if( this.m_updating)
        {
            donceCallback(false, -1, "is updating");
            return;
        }
        
        this.m_assetManager.setEventCallback((event : any)=>{
            let code = event.getEventCode();
            let result = "";
            let failed = false;
            let done = false;
            let canRetry = false;

            switch(code){
                case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                {
                    result = 'No local manifest file found, hot update skipped.';
                    failed = true;
                    break;
                }
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                {
                    let bytesPercent =  event.getPercent();
                    let filePercent = event.getPercentByFile();
                    let finishFiles = event.getDownloadedFiles();
                    let finsihBytes = event.getDownloadedBytes();
                    let totoalFiles = event.getTotalFiles();
                    let totoalBytes = event.getTotalBytes();
                    let curFile = event.getMessage();
                    processCallback && processCallback(bytesPercent, finsihBytes, totoalBytes);
                    break;
                }
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                {
                    result = 'Fail to download manifest file, hot update skipped.';
                    failed = true;
                    break;
                }
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                {
                    result = 'Already up to date with the latest remote version.';
                    failed = true;
                    break;
                }
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                {
                    result = 'Update finished. ' + event.getMessage();
                    done = true;
                    break;
                }
            case jsb.EventAssetsManager.UPDATE_FAILED:
                {
                    result = 'Update failed. ' + event.getMessage();
                    failed = true;
                    canRetry = true;
                    break;
                }
            case jsb.EventAssetsManager.ERROR_UPDATING:
                {
                    result = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                }
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                {
                    result = event.getMessage();
                }
                break;
            default:
                break;
            }

            //更新失败
            if(failed){
                if(canRetry){
                    utils.MsgBox.showConfirmCancel("更新异常是否重试?", ()=>{
                        this.m_assetManager.downloadFailedAssets();
                    }, ()=>{
                        this.m_assetManager.setEventCallback(null!);
                        this.m_updating = false;
                        donceCallback(false, code, result);
                    });
                }else{
                    this.m_assetManager.setEventCallback(null!);
                    this.m_updating = false;    
                    donceCallback(false, code, result);
                }
            }

            //更新完成
            if(done){
                this.m_updating = false;
                this.m_assetManager.setEventCallback(null!);
                let searchPaths = jsb.fileUtils.getSearchPaths();
                let newPaths = this.m_assetManager.getLocalManifest().getSearchPaths();
                log.d(JSON.stringify(newPaths));
                Array.prototype.unshift.apply(searchPaths, newPaths);
                localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
                //第一次更新才需要设置本地版本号
                if( null == localStorage.getItem("HotUpdateLocalManifestFilePath")){
                    localStorage.setItem("HotUpdateLocalManifestFilePath", this.m_manifestUrl);
                }
                jsb.fileUtils.setSearchPaths(searchPaths);
                donceCallback(true, code, result);
            }
        })

        if(this.m_assetManager.getState() === jsb.AssetsManager.State.UNINITED){
            this.m_assetManager.loadLocalManifest(this.m_manifestUrl);
        }
        
        this.m_assetManager.update();
        this.m_updating = true;
    }

    restartGame(){
        GameWorld.getInstance().restartGame();
    }
}