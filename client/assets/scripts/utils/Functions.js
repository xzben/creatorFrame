
window.handler = function (obj, method) {
    return function (...args) {
        return method.call(obj, ...args);
    }
}

window.handlerd = function (obj, method, data) {
    return function (...args) {
        return method.call(obj, ...args, data);
    }
}

window.handlerds = function (obj, method, data1, data2) {
    return function (...args) {
        return method.call(obj, ...args, data1, data2);
    }
}

window.tonumber = function (value) {
    if (typeof value != 'number') {
        return Number(value)
    }
    return value
}

window.tostring = function (value) {
    if (typeof value != 'string') {
        return value.toString()
    }
    return value
}