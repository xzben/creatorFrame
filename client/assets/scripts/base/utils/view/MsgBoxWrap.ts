/*
 * @Author: xzben
 * @Date: 2022-05-25 11:43:26
 * @LastEditors: xzben
 * @LastEditTime: 2022-05-25 12:29:38
 * @Description: file content
 */
import { ErrorCodeMap } from "../../../config/error/ErrorCodeMap"
import { UIMgr } from "../../core/UIMgr"
import { MSG_CONFIRM_CALLBACK, MSG_CANCEL_CALLBACK } from "../view/MsgBox"
export let MsgBoxWrap = {

    showConfirm( content : string, confirm : MSG_CONFIRM_CALLBACK = ()=>{}, autoclose : boolean = true){
        UIMgr.getInstance().openView("base/msgbox/msgbox", { content : content, confirm : confirm, autoclose : autoclose })
    },

    showConfirmCancel( content : string, confirm : MSG_CONFIRM_CALLBACK = ()=>{}, cancel : MSG_CANCEL_CALLBACK = ()=>{}, autoclose : boolean = true){
        UIMgr.getInstance().openView("base/msgbox/msgbox", { content : content, confirm : confirm, cancel : cancel, autoclose : autoclose })
    },

    showConfirmByErrorCode( errocode : number, confirm : MSG_CONFIRM_CALLBACK = ()=>{}, autoclose : boolean = true){
        let msg = ErrorCodeMap[errocode] || ""+errocode
        MsgBoxWrap.showConfirm(msg, confirm, autoclose);
    },

    showConfirmCancelByErrorCode( errocode : number, confirm : MSG_CONFIRM_CALLBACK = ()=>{}, cancel : MSG_CANCEL_CALLBACK = ()=>{}, autoclose : boolean = true){
        let msg = ErrorCodeMap[errocode] || ""+errocode
        MsgBoxWrap.showConfirmCancel(msg, confirm, cancel, autoclose);
    },

    showNotice( content : string, confirm : MSG_CONFIRM_CALLBACK = ()=>{}, autoclose : boolean = true){
        UIMgr.getInstance().openView("base/msgbox/noticebox", { content : content, confirm : confirm, autoclose : autoclose })
    },

    showSingleNotice( content : string, confirm : MSG_CONFIRM_CALLBACK = ()=>{}, autoclose : boolean = true){
        UIMgr.getInstance().openSingleView("base/msgbox/noticebox", { content : content, confirm : confirm, autoclose : autoclose })
    },
}