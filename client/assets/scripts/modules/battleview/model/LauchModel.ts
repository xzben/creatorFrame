/*
 * @Author: xzben
 * @Date: 2022-06-13 14:07:22
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-13 15:10:35
 * @Description: file content
 */

export interface BattleSetting{
};

export interface HeroLauchInfo{
    uid : number;
    hero : number;
    weapon : number;
    level : number;
    group : number;
    ai : boolean;
}

export interface LauchLogicConfig
{
    engine : any;
    math : { [key : string] : any};
    entitys : { [ key : string] : any };
    objects : { [ key : string] : any[] };
    special : { [ key : string] : any };
    ai : { [ key : string] : any};
}

export interface LauchData
{
    scene : number;
    randomseed : number;
    config : LauchLogicConfig;
    heros : HeroLauchInfo[];
    setting : BattleSetting;
}