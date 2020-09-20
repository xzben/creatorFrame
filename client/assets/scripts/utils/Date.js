
//时间对象
var Date_ = cc.Class({

    properties: {
        m_date : 0, //sec min day isdst wday yday year month  hour
        m_time : 0 //1970年1月1日起的毫秒数
    },

    ctor(){
        if (arguments[0] != null && arguments[0] != undefined && arguments.length == 1) {
            this.m_date = new Date(arguments[0])
        }
        else if(arguments[0] != null && arguments[0] != undefined && arguments.length > 1)
        {
            this.m_date = new Date(arguments[0] || 0, arguments[1] - 1 || 0, arguments[2] || 0, arguments[3] || 0, arguments[4] || 0, arguments[5] || 0, arguments[6] || 0)
        }
        else
        {
            this.m_date = new Date() 
        }
        this.m_time = this.m_date.getTime() //需要使用毫秒
    },

    //差别毫秒数
    difftime(date){
        return this.m_time - date.m_time
    },

    //差别秒数
    getDiffTimeToSec(){
        return (this.m_time - date.m_time) * 1000
    },

    //获取秒数
    getTime(){
        return this.m_time * 0.001
    },

    //设置从 1970/01/01 之间的毫秒数
    setTime(time){
        this.m_date.setTime(time)
        this.m_time = this.m_date.getTime()
    },

    getSeconds(){ //秒数 (0 ~ 59)
        return this.m_date.getSeconds()
    },

    setSeconds(sec){ //秒数 (0 ~ 59)
        this.m_date.setSeconds(sec)
    },

    getMinutes(){ //分钟 (0 ~ 59)
        return this.m_date.getMinutes()
    },

    setMinutes(min){ //分钟 (0 ~ 59)
        this.m_date.setMinutes(min)
    },

    getHours(){ //小时 (0 ~ 23)
        return this.m_date.getHours()
    },

    setHours(hour){ //小时 (0 ~ 23)
        this.m_date.setHours(hour)
    },

    getDay(){ //一个月中的某一天 (1 ~ 31)
        return this.m_date.getDate() 
    },

    setDay(day){ //一个月中的某一天 (1 ~ 31)
        this.m_date.setDate(day) 
    },

    getMonth(){ //
        return this.m_date.getMonth() 
    },

    setMonth(month){ //
        this.m_date.setMonth(month) 
    },

    getYear(){ //
        return this.m_date.getFullYear()
    },

    setYear(year){ //
        this.m_date.setYear(year)
    },

    getWDay(){ //一周中的某一天 (0 ~ 6)
        return this.m_date.getDay() 
    },

    getYearAndMonthAndData(){
        return {year : this.getYear(), month : this.getMonth(), day : this.getDay()}
    },

    getHourAndMinuteAndSecond(){
        return {hour: this.getHours(), min : this.getMinutes(), sec: this.getSeconds()}
    },

    unified(value){
        return value > 9 ? value : "0" + value   
    },

    toFormat(format='y-M-d h:m:s'){
        var year = this.getYear(),
            month = this.getMonth() + 1,//月份是从0开始的
            day = this.getDay(),
            hour = this.getHours(),
            min = this.getMinutes(),
            sec = this.getSeconds();
        var preArr = Array.apply(null,Array(10)).map(function(elem, index) {
            return '0'+index;
        });////开个长度为10的数组 格式为 00 01 02 03
        var newTime = format.replace(/y/g,year)
                            .replace(/M/g,preArr[month]||month)
                            .replace(/d/g,preArr[day]||day)
                            .replace(/h/g,preArr[hour]||hour)
                            .replace(/m/g,preArr[min]||min)
                            .replace(/s/g,preArr[sec]||sec);
    
        return newTime;         
    },

    toYMDFormat(separator, format){
        separator = separator ? separator : "/"
        format = format ? format : "y"+separator+"M"+separator+"d"
        return this.toFormat(format)
    },

    toHMSFormat(separator, format){
        separator = separator ? separator : ":"
        format = format ? format : "h"+separator+"m"+separator+"s"
        return this.toFormat(format)
    },
    
    toHMFormat(separator, format){
        separator = separator ? separator : ":"
        format = format ? format : "h"+separator+"m"
        return this.toFormat(format)
    },

    toFullFormat(separator1, separator2){
        return this.toYMDFormat(separator1) + " " + this.toHMSFormat(separator2)
    },

    isSameDay(date){
        return (this.getYear() == date.getYear()) &&
        (this.getMonth() == date.getMonth()) &&
        (this.getDay()  == date.getDay())
    },

    isYesterday(date){
        var dif = this.getDiffTimeToSec(date)
        if (dif < 24 * 60 * 60 * 2){
            return (this.getDay() != date.getDay())
        }
        return false
    },
})

//转换时分秒
Date_.toHMSData = function(time)
{
	var sec = time % 60
	var temp = Math.floor(time / 60)
	var min = temp % 60
	var hour = Math.floor(temp / 60)
    return {
        hour : hour ? hour : 0, 
        min : min ? min : 0, 
        sec : sec ? sec : 0
    }
}

//转换天时分秒
Date_.toDHMSData = function(time)
{
    var sec = time % 60
    var temp = Math.floor(time / 60) //m

    var min = temp % 60
    temp = Math.floor(temp / 60) //h
    
    var hour = temp % 24
    var day = Math.floor(temp / 24)
    return {
        day : day ? day : 0, 
        hour : hour ? hour : 0, 
        min : min ? min : 0, 
        sec : sec ? sec : 0
    }
}

Date_.toHMS = function(time, separator)
{
	var obj = Date_.toHMSData(time)
	return string.format("%s" + separator + "%s" + separator + "%s", obj.hour.toString(), obj.min.toString(), obj.sec.toString())
}

Date_.toMS = function(time, separator)
{
	var obj = Date_.toHMSData(time)
	return string.format("%s" + separator + "%s", obj.min, obj.sec)
}

module.exports = Date_;

