/*
 * @Author: xzben
 * @Date: 2022-06-06 20:27:16
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-13 14:07:51
 * @Description: file content
 */


export interface HeroInfo
{
    id : number;
}

export interface MatchData
{
    sceneId : number;     //匹配的战斗场景id
    randomseed : number;  //此局战斗的随机种子
    heros : HeroInfo[];   //此局战斗所有角色信息
}

export interface LoadingHeroInfo
{
    id : number;
    percent : number;
}

export interface LoadingProcessInfo
{
    heros : LoadingHeroInfo[];
}

export interface PosConfig{
    x : number;
    y : number;
    z : number;
}
