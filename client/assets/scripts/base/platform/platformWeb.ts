/*
 * @Author: xzben
 * @Date: 2022-05-25 11:43:04
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 12:32:35
 * @Description: file content
 */

import * as cc from 'cc';
import { LoginWay, PlatformType } from '../../config/PlatformConfig';
import { PlatformBase } from './platformBase';
const { ccclass, property } = cc._decorator;

@ccclass('PlatformWeb')
export class PlatformWeb extends PlatformBase{

    public getPlatform() : PlatformType{
        return PlatformType.Web;
    }

}