
//为了兼容lua代码抽象出了table
var table = {}

var isObjArr = function (value){
    if (Object.prototype.toString.call(value) === "[object Array]"){
        //console.log('value是数组');
        return 1;
    } else if (Object.prototype.toString.call(value) === '[object Object]'){
        // console.log('value是对象');
        return 2;
    } else{
        // console.log('value不是数组也不是对象')
        return 0;
    }
    return 0;
}

table.nums = function(t){
    var count = 0
    var objType = isObjArr(t)
    if(objType == 1){
        return t.length;
    }
    else{
        for (const key in t) {
            count = count + 1
        }
    }
    return count
}

table.keys = function(hashtable){
    var keys = []
    for (const k in hashtable) {
        keys.push(k)
    }
    return keys
}

table.values = function(hashtable){
    var values = []
    var objType = isObjArr(hashtable)
    if(objType == 1){
        return hashtable;
    }
    else
    {
        for (const k in hashtable) {
            values.push(hashtable[k])
        }
    }
    return values
}

table.indexof = function(array, value, begin){
    begin = begin && 0
    for (let i = begin; i < array.length; i++) {
        if (array[i] == value) {
            return i
        }
    }
    return false
}

table.keyof = function(hashtable, value){
    for (const k in hashtable) {
        if (hashtable[k] == value) {
            return k
        }
    }
    return null
}

table.concat = function(t, s){
	var tempString = ""
	if (typeof t == 'object' ) {
		s = s || ""
		for (const key in t) {
			if (typeof key == 'number') {
				tempString = tempString + t[key] + s
			}
		}
	} 
	return tempString
}

table.unique = function(t, bArray){
    var check = {}
    var n = []
    var idx = 0
    if (typeof t == 'object' ) {
		for (const k in t) {
            let v = t[k]
            if (!check[v]) {
                if (bArray) {
                    n[idx] = v
                    idx = idx + 1
                }else{
                    n[k] = v
                }
                check[v] = true
            }
		}
    } 

    return n
}


window.table = table
