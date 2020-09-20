var SoundUtil = cc.Class({
    properties: {

    },

    ctor(){
        this.m_musicVolume = 1.0;
        this.m_effectVolume = 1.0;
        this.m_isMusicOpen = true;
        this.m_isEffectOpen = true;
        this.m_musicId = null;
        this.m_lastMusicFile = null;
    },

    playBgMusic(){
        var bgMusic = game.GameCfgMgr.getInstance().getBgMusic()
        game.SoundUtil.getInstance().playMusic(bgMusic)
    },

    init()
    {
        this.m_isMusicOpen = game.StoreMgr.getInstance().getBoolValue("MUSIC_OPEN", true)
        this.m_isEffectOpen = game.StoreMgr.getInstance().getBoolValue("EFFECT_OPEN", true)
        this.m_musicVolume = game.StoreMgr.getInstance().getFloatValue("MUSIC_VOLUME", 1)
        this.m_effectVolume = game.StoreMgr.getInstance().getFloatValue("EFFECT_VOLUME", 1)
        this.setMusicVolume(this.m_musicVolume)
        this.setEffectVolume(this.m_effectVolume)
    },

    setMusicOpen( open )
    {
        this.m_isMusicOpen = open;
        game.StoreMgr.getInstance().setBoolValue("MUSIC_OPEN", open)
        if (this.m_isMusicOpen == true){
            this.resumeMusic()
        }else{
            this.pauseMusic()
        }
    },

    setEffectOpen( open )
    {
        this.m_isEffectOpen = open;
        game.StoreMgr.getInstance().setBoolValue("EFFECT_OPEN", open)
    },

    setMusicVolume( volume )
    {
        // log.d("############ setMusicVolume", volume);
        this.m_musicVolume = volume;
        cc.audioEngine.setMusicVolume(volume)
        game.StoreMgr.getInstance().setFloatValue("MUSIC_VOLUME", volume)
    },

    setEffectVolume( volume )
    {
        //  log.d("############ setEffectVolume", volume);
        this.m_effectVolume = volume;
        cc.audioEngine.setEffectsVolume(volume)
        game.StoreMgr.getInstance().setFloatValue("EFFECT_VOLUME", volume)
    },

    isMusicOpen()
    {
        // log.d("############ isMusicOpen", this.m_isMusicOpen);
        return this.m_isMusicOpen
    },

    playMusic( file ){
        // log.d("############# playMusic", file, this.isMusicOpen())
        if(!this.isMusicOpen() || this.m_lastMusicFile == file)
            return false;

        this.stopMusic()
        this.m_lastMusicFile = file;
        cc.loader.loadRes(file,cc.AudioClip,(err,audio)=>{
            if(err){
                cc.error(err.message || err);
                return;
            }
            this.m_musicId = cc.audioEngine.playMusic(audio, true);
        });
        return true;
    },
    
    pauseMusic(){
        cc.audioEngine.pauseMusic();
    },

    resumeMusic(){
        if( !this.m_isMusicOpen )
            return;
        
        if(this.m_musicId != null)
            cc.audioEngine.resumeMusic();
        else
            this.playBgMusic()
    },

    stopMusic(){
        this.m_lastMusicFile = null;
        cc.audioEngine.stopMusic();
    },

    isEffectOpen()
    {
        return this.m_isEffectOpen
    },

    playEffect( file, isLoop ){
        if(!this.isEffectOpen())
            return false;

        isLoop = util.isNull(isLoop) ? false : isLoop
        cc.loader.loadRes(file,cc.AudioClip,(err,audio)=>{
            if(err){
                cc.error(err.message || err);
                return;
            }
            // log.d("playEffect name:",file,audio.name,audio.nativeUrl)
            var id = cc.audioEngine.playEffect(audio, isLoop);
        });
        return true;
    },   

    pauseEffect(audioID){
        cc.audioEngine.pauseEffect(audioID)
    },

    pauseAllEffects(){
        cc.audioEngine.pauseAllEffects();
    },

    resumeEffect(audioID){
        cc.audioEngine.resumeEffect(audioID);
    },

    resumeAllEffects(){
        cc.audioEngine.resumeAllEffects();
    },  

    stopEffect(id){
        cc.audioEngine.stopEffect(id);
    },  

    stopAllEffects(){
        cc.audioEngine.stopAllEffects();
    },  

    uncache( file )
    {
        cc.audioEngine.uncache(file);
    },

    uncacheAll()
    {
        cc.audioEngine.uncacheAll();
    },
})

// 实例持有者
var s_instance;
var _static = {   //另一个对象
   getInstance: function(options) {
	   if(s_instance === undefined) {
		   s_instance = new SoundUtil(options);
	   }
	   return s_instance;
   }
};

module.exports = _static;
module.exports = frame.InstanceMgr.createInstance(SoundUtil)
