import { UIMgr } from "../../core/UIMgr"

let  s_count = 0;
let  s_tips : string = "";

export let LoadingViewWrap = {
    checkShowAfterChangeScene(){
        if( s_count > 0){
            UIMgr.getInstance().openSingleView("base/loading/loading", { tips : s_tips })
        }
    },

    show( tips : string = ""){
        s_tips = tips;
        s_count ++;
        console.log("LoadingViewWrap:show", s_count)
        UIMgr.getInstance().openSingleView("base/loading/loading", { tips : tips })
    },

    close(){
        s_count--;
        console.log("LoadingViewWrap:close", s_count)
        if(s_count <= 0){
            UIMgr.getInstance().closeView("base/loading/loading");
        }
    },

    isLoading(){
        return s_count > 0;
    }
}