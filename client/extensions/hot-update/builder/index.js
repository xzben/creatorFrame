exports.configs = {
    '*': {
        hooks: './builder/hook.js',
        options: {
        },
        verifyRuleMap: {
            EnvCheck : {
                message: '环境检测的合法性',
                func(val, option) {
                    console.log("test env", val)
                    return true;
                }
            }
        }
    }
};

exports.load = function() {
    
}
exports.unload = function() {
    
}

