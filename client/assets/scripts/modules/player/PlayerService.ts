/*
 * @Author: xzben
 * @Date: 2022-05-25 12:04:29
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-13 15:20:26
 * @Description: file content
 */

import * as cc from 'cc';
import { ServiceMgr } from '../../base/core';
import { BaseService } from '../../base/frame';
import { HeroLauchInfo } from '../battleview/model/LauchModel';
const { ccclass, property } = cc._decorator;

@ccclass('PlayerService')
export class PlayerService extends BaseService {
    public static getInstance() : PlayerService{
        return ServiceMgr.getService("PlayerService", PlayerService);
    }

    public getBattleHeroInfo() : HeroLauchInfo{
        return {
            uid : 10000,
            hero : 1,
            weapon : 1,
            level : 1,
            group : 1,
            ai : false
        };
    }
}