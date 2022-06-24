
//平台类型
export enum PlatformType{
    WIN32 = 1,  //电脑
    Android = 2,  //安卓
    IOS = 3,     //苹果
    Web = 4,    //浏览器
    H5 = 5,     //小游戏
    QUICK = 6,  //快游戏
}

//渠道名称(安卓平台渠道映射对应的安卓渠道配置)
export enum ChannelType{
    MiniWX = 'mini_wx',     //微信小游戏
    MiniQQ = 'mini_qq',     //QQ小游戏
    MiniByte = 'mini_byte', //字节跳动小游戏
    QuickMEIZU = 'quick_meizu', //魅族快游戏

    Official = 'official',  //官方渠道
    TapTap = 'taptap',      //TapTap
    KuaiBao = 'kuaibao',    //快爆
    MoMoYu = 'momoyu',    //摸摸鱼
    GooglePlay = 'googlePlay',  //googlePlay

    Apple = 'apple',  //IOS官方渠道
}

//游戏登录方式
export enum LoginWay{
    QUICK = 0,          //快速登录
    ACCOUNT = 1,        //账号登录
    WEIXIN = 2,         //微信登录
    TAPTAP = 3,         //taptap登录
    MINI_WEIXIN = 4,    //微信小游戏登录
    MINI_QQ = 5,        //QQ小游戏登录
    MINI_BYTE = 6,      //字节小游戏登录
    WEB_MEIZU = 7,      //魅族快游戏登录
    MOMOYU = 8,         //摸摸鱼sdk登录
    GOOGLE_PLAY = 9,   //谷歌play
    IOS_APPLE = 10,    //ios apple登录
    
    TOURIST = 99,       //游客登录
    RELATION = 100,     //账号关联
}

//渠道对应app包名 用于校验登录是否存在第三方应用
export enum AppPackageName{
    WEIXIN = "com.tencent.mm",    
    TAPTAP = "com.taptap",
    MOMOYU = "com.playgame.havefun",
}


