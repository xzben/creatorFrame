export enum ENV {
    DEBUG,
    INNER_TEST,
    OUT_TEST,
    RELEASE,
}

let cur_env = ENV.RELEASE;

export function setCurEnv( env : ENV){
    cur_env = env;
}

export function getCurEnv(): ENV{
    return cur_env;
}

