// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        pickRadius : 60,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    getPlayerDistance(){
        var playerPos = this.game.player.getPosition();
        var dist = this.node.position.sub(playerPos).mag();

        return dist;
    },

    onPicked(){
        this.game.spawnNewStar();
        this.game.gainScore();
        this.node.destroy();
    },
    start () {

    },

    update (dt) {
        if(this.getPlayerDistance() < this.pickRadius)
        {
            this.onPicked();
            return;
        }

        // var opacityRatio = 1 - this.game.timer/this.game.starDuration;
        // var minOpacity = 50;
        // this.node.opacity = minOpacity + Math.floor(opacityRatio*(255 - minOpacity));
    },
});
