/*
 * @Author: xzben
 * @Date: 2022-06-06 19:40:45
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-13 14:50:22
 * @Description: file content
 */
export enum BattleLauchEvent{
    BattleStartMatch = "BattleStartMatch", //战斗进入匹配  step 1
    BattleMatchDone = "BattleMatchDone",   //战斗匹配成功   step 2

    LoadingBattleSceneStart = "LoadingBattleSceneStartLoadingBattleSceneStart",  //开始加载战斗数据  step 3
    LoadingBattleConfigProcess = "LoadingBattleConfigProcess", //加载配置进度更新 step 4 
    LoadingBattleSceneProcess = "LoadingBattleSceneProcess", //加载场景进度更新 step 5
    LoadingBattleSceneDone = "LoadingBattleSceneDone",  //战斗场景数据加载完成 step 6

    WaitAllReadyProcess = "WaitAllReadyProcess", //等待所有人进入场景准备完毕精度 step 7
    BattleStart = "BattleStart", //所有人都加载完成游戏开始 step 8 游戏开始
}