import * as cc from "cc"
import { Network } from "../net/Network"
import { utils } from "../utils/utils";
import { ResLoader } from "./ResLoader";

const {ccclass, property} = cc._decorator;

export type LOAD_SCENE_DONE = ( success : boolean, scene ?: cc.Scene)=>void;
export type LOAD_SCENE_PROCESS =  ( percent : number )=>void;

const HALL_SCENE_PATH : string = "hall#hallScene"
const LOGIN_SCENE_PATH : string = "login#loginScene"

@ccclass
export class SceneMgr{
    public static s_instance : SceneMgr | null = null;
    public static getInstance(){
        if(this.s_instance == null){
            this.s_instance = new SceneMgr();
            this.s_instance.init()
        }
        
        return this.s_instance;
    }

    //管理当前scene 上资源的加载，场景切换是重新构造，并释放之前场景加载的所有资源
    private m_resload : ResLoader = new ResLoader();
    //用来加载Scene 使用, 场景切换是会去释放之前scene的 asset
    private m_sceneLoad : ResLoader = new ResLoader();

    private m_curScenePath : string = "";
    private m_sceneStack : string[] = [];
    private m_autoCleanScene : boolean = true;

    constructor(){

    }

    init(){
        this.m_autoCleanScene = !cc.sys.isNative;
    }

    public getSceneResLoader() : ResLoader{
        return this.m_resload;
    }

    public getCurScenePath() : string {
        return this.m_curScenePath;
    }

    public loadBundleMainScene( bundleName : string, doneCallback ?: LOAD_SCENE_DONE, process ?: LOAD_SCENE_PROCESS){
        this.loadRunScene( bundleName + ".scene/mainScene", doneCallback, process);
    }

    private beforeLoadScene( scene : cc.Scene ){

    }

    private afterLoadScene( scene : cc.Scene ) {

    }

    private handleBeforeChangeScene(){
        Network.getInstance().pauseDispatchMessage();
    }

    private handleChangeSceneDone(){
        utils.LoadingView.checkShowAfterChangeScene();
        Network.getInstance().resumeDispatchMessage();
    }

    public popFromGame(doneCallback ?: LOAD_SCENE_DONE, process ?: LOAD_SCENE_PROCESS){
        if(this.m_sceneStack.length <= 0) return;

        let scenepath : string = this.m_sceneStack[this.m_sceneStack.length - 1]
        if (scenepath == LOGIN_SCENE_PATH) {
            this.loadRunScene(HALL_SCENE_PATH, doneCallback, process);
        }else{
            let scenepath : string = this.m_sceneStack.pop()!;
            this.loadRunScene(scenepath, doneCallback, process);
        }
    }

    public popScene(doneCallback ?: LOAD_SCENE_DONE, process ?: LOAD_SCENE_PROCESS){
        if(this.m_sceneStack.length <= 0) return;
        let scenepath : string = this.m_sceneStack.pop()!;
        this.loadRunScene(scenepath, doneCallback, process);
    }

    public pushScene(path : string, doneCallback ?: LOAD_SCENE_DONE, process ?: LOAD_SCENE_PROCESS){
        if(this.m_curScenePath != path)
            this.m_sceneStack.push(this.m_curScenePath);
        this.loadRunScene(path, doneCallback, process);
    }

    public preloadScene( path : string, doneCallback ?: LOAD_SCENE_DONE, process ?: LOAD_SCENE_PROCESS){
        this.m_sceneLoad.loadScene(path, (err : Error | null, asset : cc.Scene)=>{
            if(err == null && asset.scene){
                doneCallback && doneCallback(true, asset.scene);
            }else{
                doneCallback && doneCallback(false, null!);
            }
        }, (percent)=>{
            if(process){
                process(percent);
            }
        });
    }

    public popToLoginScene(doneCallback ?: LOAD_SCENE_DONE, process ?: LOAD_SCENE_PROCESS){
        if(this.m_curScenePath == LOGIN_SCENE_PATH)
        {
            let curscene = cc.director.getScene();
            doneCallback && doneCallback(true, curscene!);
            return;
        }
        this.m_sceneStack = [];
        this.loadRunScene(LOGIN_SCENE_PATH, doneCallback, process);
    }

    public loadRunScene( path : string, doneCallback ?: LOAD_SCENE_DONE, process ?: LOAD_SCENE_PROCESS ){
        let prescenePath = this.m_curScenePath;
        this.m_curScenePath = path;
        this.handleBeforeChangeScene()
        this.m_sceneLoad.loadScene(path, (err : Error | null, asset : cc.Scene)=>{
            if(err == null && asset.scene ){
                asset.scene.autoReleaseAssets = this.m_autoCleanScene; //加载的场景全部自动释放自己加载的资源
                let resload = this.m_resload;
                this.m_resload = new ResLoader();
                cc.director.runSceneImmediate(asset.scene, ()=>{
                    this.beforeLoadScene( asset.scene );
                }, ()=>{
                    this.afterLoadScene( asset.scene )
                    if(doneCallback) doneCallback( true, asset.scene)
                    //释放原先占用的scene 资源
                    if(prescenePath != "") this.m_sceneLoad.releaseAsset(prescenePath);
                    resload.releaseAll();
                    this.handleChangeSceneDone()
                });
            }else{
                if(doneCallback) doneCallback( false )
                this.handleChangeSceneDone()
            }
        }, ( percent)=>{
            if(process){
                process(percent);
            }
        })
    }
}