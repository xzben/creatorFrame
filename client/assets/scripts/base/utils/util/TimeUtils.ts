import * as cc from "cc"

export class TimeUtils{
    /**
     * 获取当前时间戳
     * @example
     */
    public static getTimestamp(): number {
        return new Date().getTime();
    }

    /**
     * 获取当前日期（年/月/日）
     * @example
     * TimeUtil.getDate(); // "2021/3/2"
     */
    public static getDate(): string {
        return new Date().toLocaleDateString();
    }


    public static getFormat(format='y-M-d h:m:s'){
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;//月份是从0开始的
        let day = date.getDate();
        let hour = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();
        let preArr = Array.apply(null,Array(10)).map(function(elem, index) {
            return '0'+index;
        });////开个长度为10的数组 格式为 00 01 02 03
        let newTime = format.replace(/y/g,year.toString())
                            .replace(/M/g,preArr[month]||month.toString())
                            .replace(/d/g,preArr[day]||day.toString())
                            .replace(/h/g,preArr[hour]||hour.toString())
                            .replace(/m/g,preArr[min]||min.toString())
                            .replace(/s/g,preArr[sec]||sec.toString());
    
        return newTime;         
    }

    public static getMDFormat(format : string = 'M-d'){
        return TimeUtils.getFormat(format)
    }

    /**
     * 获取当天指定时间的时间戳
     * @param hour 时
     * @param minute 分
     * @param second 秒
     * @example
     */
    public static getTargetTimestamp(hour: number = 0, minute: number = 0, second: number = 0): number {
        const start = new Date(new Date().toLocaleDateString()).getTime();
        const target = ((hour * 3600) + (minute * 60) + second) * 1000;
        return new Date(start + target).getTime();
    }
    
    public static getYear() : number {
        return new Date().getFullYear();
    }

    //当天星期几
    public static getDay() : number {
        return new Date().getDay();
    }

    /**
     * 将毫秒转为时分秒的格式（最小单位为秒，如："00:01:59"）
     * @param time 秒数
     */
    public static toDHMSFormat(time : number, format : string = 'd h:m:s'): string {
        let t = time
        let sec = t % 60   //s
        let temp = Math.floor(t / 60) 

        let min = temp % 60         //m
        temp = Math.floor(temp / 60) 
         
        let hour = temp % 24        //h
        let day = Math.floor(temp / 24)   //d

        let preArr = Array.apply(null,Array(10)).map(function(elem, index) {
            return '0'+index;
        });////开个长度为10的数组 格式为 00 01 02 03
       
        let newTime = format.replace(/d/g, preArr[day] || day.toString())
                            .replace(/h/g, preArr[hour] || hour.toString())
                            .replace(/m/g, preArr[min] || min.toString())
                            .replace(/s/g, preArr[sec] || sec.toString());
    
        return newTime;  
    }

    public static is_same_day( time1 : number, time2 : number){
        let str1 = ""+time1;
        let str2 = ""+time2;

        if(str1.length == 10){
            time1 = time1*1000;
        }

        if(str2.length == 10){
            time2 = time2*1000;
        }
        
        let date1 = new Date(time1);
        let date2 = new Date(time2);

        if(date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate()){
            return true;
        }

        return false;
    }
}