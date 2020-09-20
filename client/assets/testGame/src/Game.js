// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: frame.BaseScene,

    properties: {
        starPrefeb : {
            default : null,
            type : cc.Prefab
        },

        maxStarDuration : 10,
        minStarDuration : 2,
        ground : {
            default : null,
            type : cc.Node,
        },

        player : {
            default : null,
            type : cc.Node,
        },

        scoreDisplay : {
            default : null,
            type : cc.Label,
        },

        scoreAudio : {
            default : null,
            type : cc.AudioClip,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.groundY =  this.ground.y + this.ground.height/2;
        
        this.timer = 0;
        this.startDuration = 0;
        this.spawnNewStar();
        this.score = 0;
    },

    spawnNewStar(){
        var newStar = cc.instantiate(this.starPrefeb);
        this.node.addChild(newStar);

        newStar.setPosition(this.getNewStarPosition());

        newStar.getComponent("Star").game = this;

        this.startDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPosition(){
        var randX = 0;
        var randY = this.groundY + Math.random()*this.player.getComponent("Player").jumpHeight + 50;
        
        var maxX = this.node.width / 2;

        randX = (Math.random() - 0.5) * 2* maxX;
        console.log("getNewStarPosition", randX, randY);
        return cc.v2(randX, randY);
    },

    gainScore(){
        this.score += 1;

        this.scoreDisplay.string = "Score: " + this.score;

        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    start () {

    },

    update (dt) {
        if(this.timer > this.startDuration){
            this.gameOver();
            return;
        }
        this.timer += dt;
    },

    gameOver(){
        this.player.stopAllActions();
        game.SceneMgr.getInstance().popScene();
    }
});
