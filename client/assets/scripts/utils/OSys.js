
var OSys = {}

var uniqueidCount = 0
OSys.getObjectUniquedId = function(o){
    if ( typeof o.__objectuniqueid == "undefined" ) {
        Object.defineProperty(o, "__objectuniqueid", {
            value: ++uniqueidCount,
            enumerable: false,
            // This could go either way, depending on your 
            // interpretation of what an "id" is
            writable: false
        });
    }
    return o.__objectuniqueid;
}


OSys.date = function(t){//t的单位为s秒
	var date = new util.Date(t != undefined ? t*1000 : undefined)
	return date
}

OSys.time = function(t){//t的单位为s秒
	if (typeof t == 'object') {
		// var date = new util.Date()
		// var date = new util.Date(t.year, t.month)
		// date.setYear(t.year || 0)
		// date.setMonth(t.month || 0)
		// date.setDay(t.day || 0)
		// date.setHours(t.hour || 0)
		// date.setMinutes(t.min || 0)
		// date.setSeconds(t.sec || 0)
		// return Math.floor(date.getTime())
		// var tdata = new Date (t.year, t.month, t.day, t.hour, t.min, t.sec);
		// var time =  Math.floor(tdata.getTime())
		var date = new util.Date(t.year || 0, t.month || 0,  t.day || 0, t.hour || 0, t.min || 0, t.sec || 0)
		return Math.floor(date.getTime())
		return time;
	}else{
		var date = new util.Date(t != undefined ? t*1000 : undefined)
		return Math.floor(date.getTime())
	}
}

/*
	将 "2018-04-10 00:00:00" 转成秒
*/
OSys.convertStringTimeToSce = function(timeStr){
	var times = []
	var object = string.gfind(timeStr, /\d+/g)
	for (const s in object) {
		times.push(tonumber(object[s]))
	}

	var endTime = {year : times[0], month : times[1], day : times[2], 
					  hour : times[3], min : times[4], sec : times[5]}
	var timeSec = OSys.time(endTime)  //秒
	return timeSec
}

var s_offsetTime = 0
OSys._handleSynServerTimeResponse = function(data){
	var curTime = OSys.time()
	var reqTime = data.clientTime
	if (reqTime > curTime){
		reqTime = curTime
	}
	var costtime = Math.floor((curTime - reqTime)/2)
	s_offsetTime = data.serverTime - (reqTime + costtime)
}

OSys.remote_time = function(){ 
	var curTime = util.os.time()
	return curTime + s_offsetTime
}

//计算两点之间的距离(起始点减终点)
OSys.calculateDis = function(pos1,pos2){
	var calx = pos1.x - pos2.x
    var caly = pos1.y - pos2.y
    var dis = Math.pow((calx *calx + caly * caly), 0.5)
    return dis  	
},

//计算定位距离(
OSys.getLocalPosDistance = function( lat1,  lng1,  lat2,  lng2){
    var radLat1 = lat1*Math.PI / 180.0;
    var radLat2 = lat2*Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
    Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s *6378.137 ;
	s = Math.round(s * 10000) / 10000;
	
	// 小于200m 的情况下直接距离 乘以 0.2
	if (s < 0.2)
		s = s*0.2

    return s * 1000;
},

//isEqual：判断两个对象是否键值对应相等
OSys.isEqual = function(a,b){
	//如果a和b本来就全等
	if(a===b){
		//判断是否为0和-0
		return a !== 0 || 1/a ===1/b;
	}
	//判断是否为null和undefined
	if(a==null||b==null){
		return a===b;
	}
	//接下来判断a和b的数据类型
	var classNameA=toString.call(a),
		classNameB=toString.call(b);
	//如果数据类型不相等，则返回false
	if(classNameA !== classNameB){
		return false;
	}
	//如果数据类型相等，再根据不同数据类型分别判断
	switch(classNameA){
		case '[object RegExp]':
		case '[object String]':
		//进行字符串转换比较
		return '' + a ==='' + b;
		case '[object Number]':
		//进行数字转换比较,判断是否为NaN
		if(+a !== +a){
		return +b !== +b;
		}
		//判断是否为0或-0
		return +a === 0?1/ +a === 1/b : +a === +b;
		case '[object Date]':
		case '[object Boolean]':
		return +a === +b;
	}
	//如果是对象类型
	if(classNameA == '[object Object]'){
		//获取a和b的属性长度
		var propsA = Object.getOwnPropertyNames(a),
		propsB = Object.getOwnPropertyNames(b);
		if(propsA.length != propsB.length){
		return false;
		}
		for(var i=0;i<propsA.length;i++){
		var propName=propsA[i];
		//如果对应属性对应值不相等，则返回false
		if(a[propName] !== b[propName]){
			return false;
		}
		}
		return true;
	}
	//如果是数组类型
	if(classNameA == '[object Array]'){
		if(a.toString() == b.toString()){
		return true;
		}
		return false;
	}
}


module.exports = OSys;