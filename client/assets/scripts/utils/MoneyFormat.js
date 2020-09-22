
//触摸助手
var MoneyFormat = {}

//@brief 将money以万、亿作为单位,总共保留4个数
MoneyFormat.skipMoney1 = function(money, show_length){
    show_length = show_length == undefined ? 4 : show_length
    return MoneyFormat.skipMoneyWithRetainSeveral2(money, show_length)
}

MoneyFormat.skipMoneyWithRetainSeveral2 = function(money, show_length) {
    money = tonumber(money)
    if (money == undefined) {
        return ""
    }

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



module.exports = MoneyFormat