
var util = {}

//判断对象是否为空 
util.isNull = function( obj ){
	return obj === null || obj === undefined
}

//min（包含）～ max（包含）
util.randomInt = function(min, max){
	return Math.floor(Math.random() * (max - min + 1) ) + min
}

//16进制的颜色0XFFFFFF转换 
util.toColor4b = function(value, alpha){
	let b = value % 256
	let temp = Math.floor(value / 256)
	let g = temp % 256
	let r = Math.floor(temp / 256)

	return new cc.Color(r, g, b, alpha || 255)
}

//切割文本大小，保留
//util.subUtfStr("大家好才是真的好", 0, 5, "..")  
util.subUtfStr = function( str, index, size, endStr){
	str = util.isNull(str) ? "" : str;
	
	if (str.length * 2 <= size) {
		return str;
	}
	let sumlen = 0;
	for (let i = 0; i < str.length; i++) {
		sumlen = str.charCodeAt(i) > 128 ? sumlen + 1 : sumlen + 0.5;
	}

	let strlen = 0;
	let strText = "";
	let sign = false;
	
	for (let i = 0; i < str.length; i++) {
		strText += str.charAt(i);
		strlen = str.charCodeAt(i) > 128 ? strlen + 1 : strlen + 0.5;

		if(index > 0 && strlen >= index && !sign) {
			sign = true;
			index = strText.length;
		}
		if (strlen >= size) {
			return strlen == sumlen ? strText.substring(index, strText.length) : strText.substring(index, strText.length) + endStr;
		}
	}
	return strText;
}

/**判断是否是手机号**/
util.isPhoneNumber = function(phone){
	if (util.isNull(phone)) {
		return false
	}
    var reg =/^0?1[3|4|5|6|7|8][0-9]\d{8}$/
    return reg.test(phone)
}

//检查是否是url地址
util.isUrl = function( str_url ){
    var strRegex = "((https|http|ftp|rtsp|mms)?://)"
        + "(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@ 
         + "(([0-9]{1,3}\\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184 
         + "|" // 允许IP和DOMAIN（域名）
         + "([0-9a-z_!~*'()-]+\\.)*" // 域名- www. 
         + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\\." // 二级域名 
         + "[a-z]{2,6})" // first level domain- .com or .museum 
         + "(:[0-9]{1,4})?" // 端口- :80 
         + "((/?)|" // a slash isn't required if there is no file name 
         + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)"; 
     var re=new RegExp(strRegex); 
     if (re.test(str_url)){
         return true; 
     }
     else{ 
         return false; 
     }	
}

//版本比较
util.cmpVersion = function( version1, version2 ) {
	let arrV1 = util.spliterString(version1, '.')
	let arrV2 = util.spliterString(version2, '.')
	if(arrV1.length != arrV2.length){
		return arrV1.length > arrV2.length
	}
	else{
		for(var i = 0; i < arrV1.length; i++){
			if(parseInt(arrV1[i]) < parseInt(arrV2[i])){
				return false
			}
			else if(parseInt(arrV1[i]) > parseInt(arrV2[i])){
				return true
			}
		}

		return true;
	}
},

//@brief 将money以万、亿作为单位,总共保留4个数
util.moneyFormat = function(money, show_length) {
    money = tonumber(money)
    if (money == undefined) {
        return ""
    }

    show_length = show_length == undefined ? 4 : show_length
    var str = tostring(Math.abs(money))
    var len = str.length
    var power = (len <= 8) ? 1 : 2
    var unit = (len <= 8) ? "万" : "亿"

    show_length = show_length > len ? len : show_length

    var left, right, temp
    if (len <= 4) {
        return money + ""
    }else{
        left = str.substring(0, len - power * 4)
        right = str.substring(len - power * 4, show_length) 
        if (right != "") {
            temp = tostring(tonumber(right) / (Math.pow(10 , (show_length - left.length))))
            if (temp.search(/0./) != -1) {
                right = temp.substring(2, temp.length)
            }else{
                right = ""
            }
        }
        
        if (right == "") {
            var trunc = (money < 0) ? Math.ceil : Math.floor
            return string.format("%s%s", trunc(money / Math.pow(10 , (power * 4))), unit)
        }else{
            var format = (money < 0) ? "-%s.%s%s" : "%s.%s%s"
            return string.format(format, left, right, unit)
        }
    }
}




window.util = util