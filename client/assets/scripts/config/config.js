let config = {}


let ENV = {
    INNER_TEST  : 1,    // 内侧环境
    OUT_TEST    : 2,    // 外侧环境
    RELEASE     : 3,    // 正式环境
}

const CUR_RUN = ENV.INNER_TEST;

config.getCurEnv = () => {
    return CUR_RUN;
}

config.isInnerTest = () => {
    return CUR_RUN === ENV.INNER_TEST;
}

config.isOutTest = () => {
    return CUR_RUN == ENV.OUT_TEST;
}

config.isRelease = () => {
    return CUR_RUN === ENV.RELEASE;
}

window.config = config