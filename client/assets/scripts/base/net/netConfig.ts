import { CMDC2S, CMDS2C } from "./PbCmd";

let netConfig = {
//---------------- 客户端发给服务器的 --------------------------
    C2S: {
        [CMDC2S.HEART]: {file: "proto/common", message: "common.Heart"},
        [CMDC2S.LOGIN]: {file: "proto/normal", message: "normal.LoginReq"},
        [CMDC2S.REAL_AUTH]: {file: "proto/normal", message: "normal.reqPlayerRealAuth"},

        [CMDC2S.GET_LOGIN_REWARD]: {file: "proto/login_activity", message: "login_activity.getLoginReward"},

        [CMDC2S.REQUEST_TURN_TABLE]: {file: "proto/login_activity", message: "login_activity.requestTurnTable"},
        [CMDC2S.REQ_SUM_REWARD]: {file: "proto/login_activity", message: "login_activity.requestTurnTableSumReward"},

        [CMDC2S.REQ_SHARE_VIDEO_REWARD]: {file: "proto/login_activity", message: "login_activity.reqShareVideoReward"},
        [CMDC2S.REQ_FINISH_GUIDE]: {file: "proto/login_activity", message: "login_activity.reqFinishGuide"},

        [CMDC2S.REQ_GET_POWER]: {file: "proto/hero", message: "hero.reqGetPower"},
        [CMDC2S.REQ_GET_DIAMOND]: {file: "proto/hero", message: "hero.reqGetDiamond"},
        [CMDC2S.REQ_ACHIEVE_REWARD]: {file: "proto/hero", message: "hero.reqGetAchieveReward"},

        [CMDC2S.GET_EMAIL_LIST]: {file: "proto/email", message: "email.get_remail_list"},
        [CMDC2S.READ_EMAIL]: {file: "proto/email", message: "email.read_email"},
        [CMDC2S.DELETE_EMAIL]: {file: "proto/email", message: "email.delete_email"},

        [CMDC2S.REQ_RANK_LIST]: {file: "proto/game", message: "game.reqRankList"},

        [CMDC2S.MATCH_ROOM]: {file: "proto/game", message: "game.startMatch"},
        [CMDC2S.EXIT_GAME]: {file: "proto/game", message: "game.exitGame"},
        [CMDC2S.SETTLEMENT_GAME]: {file: "proto/game", message: "game.reqSettlementGame"},
        [CMDC2S.GET_BATTLE_REWARD]: {file: "proto/game", message: "game.reqGameOverRankReward"},

        [CMDC2S.MOVE_OPERATE]: {file: "proto/battle", message: "battle.moveOperate"},
        [CMDC2S.BATTLE_READY] : { file : "proto/battle", message : "battle.ready" },
        [CMDC2S.PLAY_SKILL] : { file : "proto/battle", message : "battle.playSkill" },
        [CMDC2S.OTHER_GAME_OP] : { file : "proto/battle", message : "battle.otherOperate" },

        [CMDC2S.LOADING_PRCESS] : { file : "proto/battle", message : "battle.LoadingProcess" },
        [CMDC2S.RECONNECT_GAME] : { file : "proto/battle", message : "battle.reconnectGame" },
        [CMDC2S.GET_GAME_FRAME] : { file : "proto/battle", message : "battle.reqGameFrames" },

        [CMDC2S.SET_USE_HERO] : { file : "proto/hero", message : "hero.reqUseHero" },
        [CMDC2S.REQ_VIEW_AD] : { file : "proto/hero", message : "hero.reqViewADShow" },
        [CMDC2S.REQ_GET_HERO] : { file : "proto/hero", message : "hero.reqGetHero" },
        [CMDC2S.REQ_GET_TRY_HERO] : { file : "proto/hero", message : "hero.reqGetTryHero" },
        [CMDC2S.REQ_MERGE_HERO] : { file : "proto/hero", message : "hero.reqMergeHero" },
        [CMDC2S.REQ_UPLEVEL_SKILL] : { file : "proto/hero", message : "hero.reqUpLevelSkill" },
    },

//----------------- 服务器发给客户端的 -------------------------
    S2C : {
        [CMDS2C.SESSION] : {file: "proto/common", message: "common.Emtpy"},
        [CMDS2C.HEART] : {file: "proto/common", message: "common.Heart"},
        [CMDS2C.LOGIN_OTHER] : {file: "proto/common", message: "common.Emtpy"},
        [CMDS2C.LOGIN] : {file: "proto/normal", message: "normal.LoginResp"},
        [CMDS2C.REAL_AUTH] : {file: "proto/normal", message: "normal.respPlayerRealAuth"},
        
        [CMDS2C.UPDATE_ITEM] : {file: "proto/normal", message: "normal.ItemChangeList"},
        [CMDS2C.UPDATE_PROPERTY] : {file: "proto/normal", message: "normal.PropertyChange"},
        [CMDS2C.LOGIN_REWARD_RESP] : {file: "proto/login_activity", message: "login_activity.getLoginRewardResp"},

        [CMDS2C.TURN_TABLE_RESULT] : {file: "proto/login_activity", message: "login_activity.TurnResult"},
        [CMDS2C.RESP_SUM_REWARD] : {file: "proto/login_activity", message: "login_activity.TurnSumReward"},

        [CMDS2C.RESP_SHARE_VIDEO_REWARD] : {file: "proto/login_activity", message: "login_activity.respShareVideoReward"},
        [CMDS2C.RESP_FINISH_GUIDE] : {file: "proto/login_activity", message: "login_activity.respFinishGuide"},

        [CMDS2C.RESP_GET_POWER] : {file: "proto/hero", message: "hero.respGetPower"},
        [CMDS2C.RESP_GET_DIAMOND] : {file: "proto/hero", message: "hero.respGetDiamond"},
        [CMDS2C.RESP_ACHIEVE_REWARD] : {file: "proto/hero", message: "hero.respAchieveReward"},
        
        [CMDS2C.EMAIL_LIST_RESP] : {file: "proto/email", message: "email.email_list"},

        [CMDS2C.RESP_RANK_LIST] : {file: "proto/game", message: "game.respRanList"},

        [CMDS2C.MATCH_ROOM]: {file: "proto/game", message: "game.respMatch"},
        [CMDS2C.EXIT_GAME]: {file: "proto/game", message: "game.respExitGame"},
        [CMDS2C.SETTLEMENT_GAME]: {file: "proto/game", message: "game.respSettlementGame"},
        [CMDS2C.GET_BATTLE_REWARD]: {file: "proto/game", message: "game.respGameOverRankReward"},

        [CMDS2C.SET_USE_HERO]: {file: "proto/hero", message: "hero.respUseHero"},
        [CMDS2C.RESP_VIEW_AD]: {file: "proto/hero", message: "hero.respViewADShow"},
        [CMDS2C.RESP_GET_HERO]: {file: "proto/hero", message: "hero.respGetHero"},
        [CMDS2C.RESP_GET_TRY_HERO]: {file: "proto/hero", message: "hero.respGetTryHero"},
        [CMDS2C.RESP_MERGE_HERO]: {file: "proto/hero", message: "hero.respMergeHero"},
        [CMDS2C.RESP_UPLEVEL_SKILL]: {file: "proto/hero", message: "hero.respUpLevelSkill"},

        [CMDS2C.BATTLE_START] : {file: "proto/battle", message: "battle.battleStart"},
        [CMDS2C.GAME_FRAME] : {file: "proto/battle", message: "battle.frames"},
        [CMDS2C.RECONNECT_GAME] : {file: "proto/battle", message: "battle.playerReconnectGame"},
        [CMDS2C.RESP_GAME_FRAME] : {file: "proto/battle", message: "battle.respGameFrames"},
        [CMDS2C.GAME_OVER] : {file: "proto/battle", message: "battle.gameOver"},
        [CMDS2C.NOTIFY_PLAYER_EXIT]: {file: "proto/battle", message: "battle.notifyPlayerExitGame"},
        [CMDS2C.ALL_READY]: {file: "proto/battle", message: "battle.notifyAllReady"},
        [CMDS2C.LOADING_PROCESS]: {file: "proto/battle", message: "battle.LoadingProcess"},
    }
}

export { netConfig }