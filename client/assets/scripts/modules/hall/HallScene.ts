/*
 * @Author: xzben
 * @Date: 2022-06-06 18:23:55
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-07 09:49:28
 * @Description: file content
 */
import * as cc from 'cc';
import { SceneMgr, UIMgr } from '../../base/core';
import { BaseScene } from '../../base/frame';
import { GameService } from '../battleview/GameService';
const { ccclass, property } = cc._decorator;

@ccclass('HallScene')
export class HallScene extends BaseScene {

    handleStartGame()
    {
        SceneMgr.getInstance().pushScene("test#scene")
    }

    start() {

    }
}