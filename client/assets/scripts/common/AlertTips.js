cc.Class({
    name : "AlertTips",
    extends: require("BaseView"),
    properties: {
        content     : cc.Label,
    },

    setText( text ){
        this.content.strintg = text;
    },

    showAnim( doneCallback ){
        var action1 = cc.fadeIn(0.4)
        var action2 = cc.delayTime(1)
        var action3 = cc.moveBy(0.6, cc.v2(0, 220))
        var action4 = cc.moveBy(0.3, cc.v2(0, 200))
        var actionFade = cc.fadeOut(0.2)
        var spawn = cc.spawn(action4,actionFade)
        var actionFunc = cc.callFunc(handler(this,function() {
            this.m_presenter.close()
        }))

        var seqAction = cc.sequence(action1, action3, action2,spawn,actionFunc)
        this.runAction(seqAction)
    },

    closeAnim( doneCallback ){
        this.node.runAction(cc.callFunc(doneCallback))
    }
})