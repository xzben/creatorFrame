/*
 * @Author: xzben
 * @Date: 2022-05-25 11:43:26
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 12:29:55
 * @Description: file content
 */
import { ErrorCodeMap } from "../../../config/error/ErrorCodeMap";
import { UIMgr } from "../../core/UIMgr"

export let AlterTipsWrap = {
    show( tips : string){
        UIMgr.getInstance().openView("base/alertTips/alter_tips", { tips : tips }, 10)
    },

    showByErrorCode( errocode : number){
        let msg = ErrorCodeMap[errocode] || ""+errocode
        AlterTipsWrap.show(msg);
    }
}