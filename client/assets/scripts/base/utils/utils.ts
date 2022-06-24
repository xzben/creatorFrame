import * as cc from 'cc';
import { AutoNode, AutoNodeEventCallback } from './autonode/AutoNode';
import { TouchUtils } from './util/TouchUtils';
import { AlterTipsWrap } from "./view/AlterTipsWrap"
import { LoadingViewWrap } from './view/LoadingViewWrap';
import { MsgBoxWrap } from './view/MsgBoxWrap';

class utils {
    static s_serverOffsetTime = 0;

    static setColorAlpha( color : cc.Color, alph : number){
        return cc.color(color.r, color.g, color.b, alph)
    }
    
    static setServerOffsetTime( offset : number){
        this.s_serverOffsetTime = offset;
    }
    
    static server_time(){
        let curtime = utils.time();
        return curtime + this.s_serverOffsetTime;
    }

    static setUILocalZOrder( node : cc.Node, zorder : number){
        // node.setSiblingIndex(zorder);
        let uitransform = node.getComponent(cc.UITransform);
        cc.assert(uitransform, "can't find UITransform");
        if(uitransform)
            uitransform.priority = zorder;
    }

    static getNodeSize( node : cc.Node ): cc.Size{
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return cc.size(0, 0);

        return uitransform.contentSize;
    }

    static setNodeSize( node : cc.Node, size : cc.Size){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return
        uitransform.contentSize = size;
    }

    static setNodeWidth( node : cc.Node, width : number){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return
        uitransform.contentSize = cc.size(width, uitransform.contentSize.height);
    }

    static setNodeHeight( node : cc.Node, height : number){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return
        uitransform.contentSize = cc.size(uitransform.contentSize.width, height);
    }

    static setPositionX( node : cc.Node, x : number){
        node.setPosition(x, node.position.y, node.position.z)
    }

    static setPositionY( node : cc.Node, y : number){
        node.setPosition(node.position.x, y, node.position.z)
    }

    static setNodeAnchorPoint( node : cc.Node, anchorPoint : cc.Vec2){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return
        uitransform.setAnchorPoint(anchorPoint);
    }

    static convertToNodeSpaceAR(node : cc.Node, worldPoint: cc.Vec3){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return cc.v3(0, 0, 0)
        return uitransform.convertToNodeSpaceAR(worldPoint);
    }

    static convertToWorldSpaceAR(node : cc.Node, nodePoint: cc.Vec3){
        let uitransform = node.getComponent(cc.UITransform);
        if(uitransform == null)
            return cc.v3(0, 0, 0)
        return uitransform.convertToWorldSpaceAR(nodePoint);
    }

    static randomInt( min : number, max : number){
        return Math.floor(Math.random() * (max - min + 1) ) + min
    }

    //16进制的颜色0XFFFFFF转换
    static toColor4b(value : number, alpha : number) : cc.Color{
        let b = value % 256
        let temp = Math.floor(value / 256)
        let g = temp % 256
        let r = Math.floor(temp / 256)

        return new cc.Color(r, g, b, alpha || 255)
    }

    static isPhoneNumber(phone : string) : boolean{
        var reg =/^0?1[3|4|5|6|7|8][0-9]\d{8}$/
        return reg.test(phone)
    }

    static isName(name : string) : boolean{
        var reg =/^[\u4E00-\u9FA5]{2,4}$/
        return reg.test(name)
    }

    static isIdNumber(id : string) : boolean {
        var p = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
        var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
        var code = id.substring(17);
        if(p.test(id)) {
            var sum = 0;
            for(var i = 0; i < 17; i++) {
                let val = Number(id[i]);
                sum += val*factor[i];
            }
            if(parity[sum % 11] == code.toUpperCase()) {
                return true;
            }
        }
        return false;
    }

    static subUtfStr( str : string, index : number, size : number, endStr : string)
    {    
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

    static formatUrl2SSLUrl(str_url : string){
        let url = str_url;
        if (typeof url == "string") {
            url = url.replace('http://', 'https://');
        }
        return url;
    }

    static isUrl(str_url : string) : boolean
    {
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

    static addClickCallback( widget : cc.Node | cc.Button | null, callback : (...param:any[])=>void){
        TouchUtils.addClickCallback(widget, callback)
    }

    static addClickCallbackFunc(widget : cc.Node | cc.Button | null, owner : Object, funcName : string){
        TouchUtils.addClickCallbackFunc(widget, owner, funcName)
    }

    public static parseGetParams() : Map<string, string>{
        let params = new Map;

        if(window.location)
        {
            let search = location.search;
            if(!search || search == "")
                return params;

            search = search.slice(1);
            let arr = search.split("&");
            for(let i = 0; i < arr.length; i++){
                let item = arr[i];
                let temp = item.split("=");
                params.set(temp[0], temp[1]);
            }
        }

        return params;
    }

    public static getQuery(key : string, def : string)
    {
        if (window.location)
        {
            let search = location.search;
            if (search == "") {
                return def;
            }
            search = search.slice(1);
            let searchArr = search.split("&");
            let length = searchArr.length;
            for (let i = 0; i < length; i++) {
                let str = searchArr[i];
                let arr = str.split("=");
                if (arr[0] == key) {
                    return decodeURIComponent(arr[1]);
                }
            }
        }
        return def;
    }

    
    static getChildByName(node : cc.Node, strName : string) : cc.Node | null
    {
        let arr = strName.split(".")
        let parent : cc.Node | null = node

        for(var i = 0; i < arr.length; i++)
        {
            var curName = arr[i]
            parent = parent.getChildByName(curName);
            if(parent === null){
                return null;
            }
        }
        return parent

    }

    static getChildComponent(node : cc.Node, childname : string, comName : string) : cc.Component | null
    {
        let tempNode = this.getChildByName(node, childname)
        if(tempNode != null){
            return tempNode.getComponent(comName)
        }
        return null;
    }

    private static  s_objectUniquedIdCount = 0;
    static getObjectUniquedId(o : any)
    {
        if ( typeof o.__objectuniqueid == "undefined" ) {
            Object.defineProperty(o, "__objectuniqueid", {
                value: ++this.s_objectUniquedIdCount,
                enumerable: false,
                writable: false
            });
        }
        return o.__objectuniqueid;
    }

    static setObjectUniquedId( o : any, value : number){
        if ( typeof o.__objectuniqueid == "undefined" ) {
            Object.defineProperty(o, "__objectuniqueid", {
                value: value,
                enumerable: false,
                writable: false
            });
        }
        return o.__objectuniqueid;
    }

    static removeSuffix( path : string) : string{
        let idx = path.lastIndexOf(".");
        if(idx != -1){
            return path.substring(0, idx);
        }

        return path;
    }

    static getSuffix( path : string) : string{
        let idx = path.lastIndexOf(".");
        if(idx != -1){
            return path.substr(idx+1);
        }

        return path;
    }

    static clone(Obj : any){
        var buf : any;
        if(Obj instanceof Array){
            buf= new Array;
            var i=Obj.length;
            while(i--){
                buf[i]=this.clone(Obj[i]);
            }
            return buf;
        }
        else if( Obj instanceof Map){
            buf = new Map;
            Obj.forEach((v, k)=>{
                buf.set(k, v )
            })
            return buf;
        }
        else if(Obj instanceof Object){
            buf={};
            for(var k in Obj){
                buf[k]=this.clone(Obj[k]);
            }
            return buf;
        }else{
            return Obj;
        }
    }

    public static formatStr(str : string,  ...args: any) : string {
        var result = str;
        if (args.length > 0) {
            if (args.length == 1 && typeof (args[0]) == "object") {
                let obj = args[0];
                for (var key in obj) {
                    
                    let value = obj[key];
                    if(typeof(value) == "string")
                        value = value.toString();

                    if(obj[key]!=undefined){
                        var reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, value);
                    }
                }
            }
            else {
                for (var i = 0; i < args.length; i++) {
                    if (args[i] != undefined) {
                        var reg= new RegExp("({)" + i + "(})", "g");
                        let value = args[i];
                        if(typeof(value) == "string")
                            value = value.toString();
                        result = result.replace(reg, value);
                    }
                }
            }
        }
        return result;
    }
    
    public static getRotation( direct : cc.Vec2 ) : number{
        direct.normalize();

        let x = direct.x;
        let y = direct.y;   
        if(y == 0){
            if(x > 0) return 0;
            if(x < 0) return 180;
        }

        if(x == 0){
            if(y > 0) return 90;
            if(y < 0) return 270;
        }

        if( y > 0 && x < 0){
           return 180 - Math.asin(y)*180/Math.PI;
        }else if( y > 0 && x > 0){
            return Math.asin(y)*180/Math.PI;
        }
        else if( y < 0 && x < 0){
           return 180 + Math.asin(-1*y)*180/Math.PI;
        }
        else if( y < 0 && x > 0){
            return 360 - Math.asin(-1*y)*180/Math.PI;
        }

        return 0;
    }

    public static time():number{
        let date = new Date();
        return Math.floor(date.getTime()/1000);
    }

    public static timeus():number{
        let date = new Date();
        return date.getTime();
    }

    public static get AlertTips(){
        return AlterTipsWrap;
    }

    public static get MsgBox(){
        return MsgBoxWrap;
    }

    public static get LoadingView(){
        return LoadingViewWrap;
    }

    public static changeNodeLayer( node : cc.Node, layer :number){
        node.layer = layer;
        node.children.forEach(( chNode : cc.Node)=>{
            utils.changeNodeLayer(chNode, layer);
        })
    }

    //返回 0 代表版本相等  > 0 代表 versionA > versionB  否则代表 versionA < versionB
    public static versionCmp( versionA : string, versionB : string) : number{
        let vA = versionA.split(".");
        let vB = versionB.split(".");

        for(let i = 0; i < vA.length; i++){
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i] || "0");

            if( a === b){
                continue
            }else{
                return a - b;
            }
        }

        if(vB.length > vA.length){
            return -1;
        }else{
            return 0;
        }
    }

    public static addAutoNode( parent : cc.Node | cc.Scene, callback : AutoNodeEventCallback){
        let node = new cc.Node();
        let auto = node.addComponent(AutoNode);
        auto.setCallback(callback);
        parent.addChild(node);
    }

    public static getIDCardAge( idcard : string){
        if(idcard == "") return 0;

        let birthtime = idcard.substr(6, 8);
        let year = parseInt(birthtime.substr(0, 4));
        let month = parseInt(birthtime.substr(2, 2));
        let day = parseInt(birthtime.substr(4, 2));

        let date = new Date();

        let age = date.getFullYear() - year;

        if(date.getMonth() > month){
            age++;
        }

        return age;
    }

    

    public static _stringToArray (string: string) {
        // 用于判断emoji的正则们
        var rsAstralRange = '\\ud800-\\udfff';
        var rsZWJ = '\\u200d';
        var rsVarRange = '\\ufe0e\\ufe0f';
        var rsComboMarksRange = '\\u0300-\\u036f';
        var reComboHalfMarksRange = '\\ufe20-\\ufe2f';
        var rsComboSymbolsRange = '\\u20d0-\\u20ff';
        var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
        var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + ']');

        var rsFitz = '\\ud83c[\\udffb-\\udfff]';
        var rsOptVar = '[' + rsVarRange + ']?';
        var rsCombo = '[' + rsComboRange + ']';
        var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
        var reOptMod = rsModifier + '?';
        var rsAstral = '[' + rsAstralRange + ']';
        var rsNonAstral = '[^' + rsAstralRange + ']';
        var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
        var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
        var rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
        var rsSeq = rsOptVar + reOptMod + rsOptJoin;
        var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
        var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

        var hasUnicode = function (val: any) {
            return reHasUnicode.test(val);
        };

        var unicodeToArray = function (val: any) {
            return val.match(reUnicode) || [];
        };

        var asciiToArray = function (val: any) {
            return val.split('');
        };

        return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }

    /**
     * 格式化名字，XXX...
     * @param {string} name 需要格式化的字符串 
     * @param {number}limit 
     * @returns {string} 返回格式化后的字符串XXX...
     */
     public static formatName (name: string, limit: number) {
        limit = limit || 6;
        var nameArray = this._stringToArray(name);
        var str = '';
        var length = nameArray.length;
        if (length > limit) {
            for (var i = 0; i < limit; i++) {
                str += nameArray[i];
            }

            str += '...';
        } else {
            str = name;
        }

        return str;
    }

        /**
     * 获取字符串长度
     * @param {string} render 
     * @returns 
     */
    public static getStringLength (render: string) {
        let strArr: string = render;
        let len: number = 0;
        for (let i: number = 0, n = strArr.length; i < n; i++) {
            let val: number = strArr.charCodeAt(i);
            if (val <= 255) {
                len = len + 1;
            } else {
                len = len + 2;
            }
        }

        return Math.ceil(len / 2);
    }

        /**
     * 判断是否是新的一天
     * @param {Object|Number} dateValue 时间对象 todo MessageCenter 与 pve 相关的时间存储建议改为 Date 类型
     * @returns {boolean}
     */
    public static isNewDay (dateValue: Date | number | string) {
        // todo：是否需要判断时区？
        var oldDate: any = new Date(dateValue);
        var curDate: any = new Date();

        //@ts-ignore
        var oldYear = oldDate.getYear();
        var oldMonth = oldDate.getMonth();
        var oldDay = oldDate.getDate();
        //@ts-ignore
        var curYear = curDate.getYear();
        var curMonth = curDate.getMonth();
        var curDay = curDate.getDate();

        if (curYear > oldYear) {
            return true;
        } else {
            if (curMonth > oldMonth) {
                return true;
            } else {
                if (curDay > oldDay) {
                    return true;
                }
            }
        }

        return false;
    }

        /**
     * 判断当前时间是否在有效时间内
     * @param {String|Number} start 起始时间。带有时区信息
     * @param {String|Number} end 结束时间。带有时区信息
     */
    public static isNowValid (start: string | number | Date, end: string | number | Date) {
        var startTime = new Date(start);
        var endTime = new Date(end);
        var result = false;

        if (startTime.getDate() + '' !== 'NaN' && endTime.getDate() + '' !== 'NaN') {
            var curDate = new Date();
            result = curDate < endTime && curDate > startTime;
        }

        return result;
    }

    /**
     * 返回相隔天数
     * @param start 
     * @param end 
     * @returns 
    */
    public static getDeltaDays (start: Date | number | string, end: Date | number | string) {
        start = new Date(start);
        end = new Date(end);

        let startYear: number= start.getFullYear();
        let startMonth: number= start.getMonth() + 1;
        let startDate: number= start.getDate();
        let endYear: number= end.getFullYear();
        let endMonth: number= end.getMonth() + 1;
        let endDate: number= end.getDate();

        start = new Date(startYear + '/' + startMonth + '/' + startDate + ' GMT+0800').getTime();
        end = new Date(endYear + '/' + endMonth + '/' + endDate + ' GMT+0800').getTime();

        let deltaTime = end - start;
        return Math.floor(deltaTime / (24 * 60 * 60 * 1000));
    }

    /**
     * 用于数值到达另外一个目标数值之间进行平滑过渡运动效果
     * @param {number} targetValue 目标数值 
     * @param {number} curValue 当前数值
     * @param {number} ratio    过渡比率
     * @returns 
    */
    public static lerp (targetValue: number, curValue: number, ratio: number = 0.25) {
        let v: number = curValue;
        if (targetValue > curValue) {
            v = curValue + (targetValue - curValue) * ratio;
        } else if (targetValue < curValue) {
            v = curValue - (curValue - targetValue) * ratio;
        }

        return v;
    }
}

export { utils }