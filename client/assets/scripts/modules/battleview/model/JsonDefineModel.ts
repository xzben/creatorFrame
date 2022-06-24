/*
 * @Author: xzben
 * @Date: 2022-06-13 14:19:30
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-13 14:34:18
 * @Description: file content
 */
export interface JsonNamePath{
    name : string;
    path : string;
};

export interface LauchJsonConfig{
    engine : string;   
    math : JsonNamePath[];
    entitys : JsonNamePath[];
    objects : JsonNamePath[];
    special : JsonNamePath[];
    ai : JsonNamePath[];
};


export interface EngineJsonConfig{
    systems : { name : string, class : string}[];
};

export interface SceneJsonConfig{
    id : number;
    name : string;
    path : string;
    battle_time : number;
    revive_time : number;
    playernum : number;
    ready_timeout : number;
}