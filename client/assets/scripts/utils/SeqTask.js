
var SeqTask = cc.Class({
    properties: {
        m_listTask : [],
        m_isFinish : false,
    },

    ctor(){
        for(var i = 0; i < arguments.length;i++){
            this.m_listTask.push(arguments[i])
        }
        this.m_isFinish = this.m_listTask.length <= 0
    },

    start(){
        var task = this.m_listTask.shift()
        if (typeof(task) == "function"){
            task(this)
        } 
    },

    oneTaskDone(){
        if (this.m_listTask.length <= 0) {
            this.m_isFinish = true
            return
        }

        var task = this.m_listTask.shift()
        if (typeof(task) == "function"){
            task(this)
        } 
    },

    isFinish(){
        return this.m_isFinish
    },

    tryDoTask(){
        var task = this.m_listTask[0]
        if (typeof(task) == "function"){
            task(this)
        }else{
            this.m_isFinish = true
        }
    },

    tryNextTask(){
        this.m_listTask.splice(0, 1)
        this.tryDoTask()
    },

    setTaskList(){
        this.m_listTask = []
        for(var i = 0; i < arguments.length;i++){
        this.m_listTask.push(arguments[i])
    }
    },

    pushTask(){
        for(var i = 0; i < arguments.length;i++){
            this.m_listTask.push(arguments[i])
        }
    },

    resetStatus(){
        this.m_isFinish = this.m_listTask.length == 0
    },
})

module.exports = SeqTask