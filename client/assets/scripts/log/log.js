/**
 * trace
 * @param [int] [count=10]
 */
function trace () 
{
    console.trace.apply(null,arguments)
}

function info()
{
    console.log.apply(null,arguments)
}

function debug()
{
    // cc.log.apply(null,arguments)
    console.log.apply(null,arguments) 
}

function warn()
{
    console.log("################### warn begin ###################")
    console.log.apply(null,arguments)
    console.log("################### warn end ###################")
}

function error()
{
    console.log("################### error begin ###################")
    console.log(arguments)
    console.log("################### error end ###################")
}

function tryError( err )
{
    console.log("################### tryError begin ###################")
    console.log(err, err.stack)
    console.log("################### tryError end ###################")
}

var log = {
    i : info,
    d : debug,
    w : warn,
    e : error,
    trace : trace,
    tryError : tryError,
}

window.log = log