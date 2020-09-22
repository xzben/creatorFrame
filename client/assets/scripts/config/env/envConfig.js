let envConfig = {}

let ENV = {
    INNER_TEST  : 1,    // 内侧环境
    OUT_TEST    : 2,    // 外侧环境
    RELEASE     : 3,    // 正式环境
}

const CUR_RUN = ENV.INNER_TEST;

envConfig.ENV = ENV;

envConfig.getCurEnv = () => {
    return CUR_RUN;
}

envConfig.isInnerTest = () => {
    return CUR_RUN === ENV.INNER_TEST;
}

envConfig.isOutTest = () => {
    return CUR_RUN == ENV.OUT_TEST;
}

envConfig.isRelease = () => {
    return CUR_RUN === ENV.RELEASE;
}

export default envConfig;