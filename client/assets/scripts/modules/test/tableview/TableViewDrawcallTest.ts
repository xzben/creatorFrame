/*
 * @Author: xzben
 * @Date: 2022-06-06 18:23:55
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-06 18:25:24
 * @Description: file content
 */
import * as cc from 'cc';
import { BaseView } from '../../../base/frame';
import { TableView } from '../../../base/gui';
import { utils } from '../../../base/utils/utils';
const { ccclass, property } = cc._decorator;

let ICONS = [
    "arrContinuous",
    "arrowDouble",
    "arrowFire",
    "arrowice",
    "arrowLaunch",
    "arrowLightning",
    "arrowPenetrate",
    "arrowRebound",
    "arrowReverse",
]

const ICON_SIZE = ICONS.length;

@ccclass('TableViewDrawcallTest')
export class TableViewDrawcallTest extends BaseView {

    @property(TableView)
    private listview : TableView = null!;

    start() {
        let listdata = [];
        for(let i = 0; i < 100; i++)
        {
            let idx = utils.randomInt(1, ICON_SIZE) - 1;
            console.log("index", i, idx);

            let item = {
                name : ICONS[idx],
                icon : `test#skillIcon/${ICONS[idx]}`,
                num : utils.randomInt(0, 100),
                total : utils.randomInt(100, 1000),
            }
            listdata.push(item);
        }
        console.log("litdata", listdata)
        this.listview.setData(listdata);
        this.listview.reloadData();
    }
}