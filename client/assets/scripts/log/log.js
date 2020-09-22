const LogController = require("LogController")
const LogLevel = require("LogLevel")

function trace(... params ) 
{
    console.trace.apply(null,params)
}

function LogBase(level, params)
{
    LogController.getInstance().handleLog(level, params)
}

function info( ... params )
{
    LogBase(LogLevel.INFO, params)
}

function debug(... params )
{
    LogBase(LogLevel.DEBUG, params)
}

function warn(... params )
{
    LogBase(LogLevel.DEBUG, "################### warn begin ###################")
    LogBase(LogLevel.WARN, params)
    LogBase(LogLevel.DEBUG, "################### warn end ###################")
}

function error(... params )
{
    LogBase(LogLevel.DEBUG, "################### error begin ###################")
    LogBase(LogLevel.ERROR, params)
    LogBase(LogLevel.DEBUG, "################### error end ###################")
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
    LogController : LogController,
}

window.log = log