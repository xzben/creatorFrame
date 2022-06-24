import * as cc from 'cc';
import { log } from "../../log/log"

const { ccclass, property } = cc._decorator;

const TIMEOUT = 5000;
const HTTP_TRY_COUNT = 5;

@ccclass("HttpUtils")
export class HttpUtils  {
    public static httpGet(url: string, callback: (data: any) => void, req?: any) {
        let tagetUrl = url
        log.d("====httpGet======url:", url)

        // var xhr = cc.loader.getXMLHttpRequest();
        let xhr = new XMLHttpRequest();
        if (req == null) {
            req = {};
            req.timeout = req.timeout ? req.timeout : TIMEOUT;
            req.callback = callback;
            req.url = url;
            req.tryindex = 0;
            req.trycount = HTTP_TRY_COUNT;
            req.xhr = xhr;
        }
        xhr.onreadystatechange = function () {
            log.d('===httpGet xhr.readyState='+xhr.readyState+'  xhr.status='+xhr.status);
            if (xhr.readyState === 4 && xhr.status >= 200) {
                // log.d("====httpGet responseText:" + xhr.responseText);
                // let txt = xhr.responseText == "" ? xhr.responseText : JSON.parse(xhr.responseText);
                callback(xhr.responseText);
            }else{
                if (xhr.status === 404) {
                    log.d('404 page not found!');
                } else if (xhr.readyState === 3) {
                    log.d('Request dealing!');
                } else if (xhr.readyState === 2) {
                    log.d('Request received!');
                } else if (xhr.readyState === 1) {
                    log.d('Server connection established! Request hasn\'t been received');
                } else if (xhr.readyState === 0) {
                    log.d('Request hasn\'t been initiated!');
                }
            }
        };
        xhr.ontimeout = function () {
            req.tryindex++;
            if (req.tryindex < req.trycount) {
                HttpUtils.httpGet(req.url, req.callback, req);
            } else {
                log.d("httptimeout");
                callback(null)
            }

        }
        xhr.onerror = function (err) {
            log.d(err);
            req.tryindex++;
            log.d("onerror tryindex:"+req.tryindex);
            if (req.tryindex < req.trycount) {
                HttpUtils.httpGet(req.url, req.callback, req);
            } else {
                log.d("httperror");
                callback(null);
            }
        }
        xhr.open("GET", tagetUrl, true);
        if (cc.sys.isNative) {
            xhr.setRequestHeader('Accept-Encoding','gzip,deflate');
        }
        // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        // xhr.setRequestHeader("Content-Type", "application/json");

        xhr.timeout = req.timeout;// 5 seconds for timeout
        xhr.send();

    }

    public static httpPost(url: string, params: any, callback: (data : any) => void,req ?: any) {
        let xhr = new XMLHttpRequest();
        if (req == null) {
            req = {};
            req.timeout = req.timeout ? req.timeout : TIMEOUT;
            req.callback = callback;
            req.url = url;
            req.tryindex = 0;
            req.trycount = HTTP_TRY_COUNT;
            req.xhr = xhr;
            req.params = params;
        }
        xhr.onreadystatechange = function () {
            // log.d('xhr.readyState='+xhr.readyState+'  xhr.status='+xhr.status);
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                var respone = xhr.responseText;
                callback(respone);
            } else {
                callback(-1);
            }
        };
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8");

        xhr.timeout = TIMEOUT;// 5 seconds for timeout
        xhr.send(req.params);
        xhr.ontimeout = function () {
            req.tryindex++;
            if (req.tryindex < req.trycount) {
                HttpUtils.httpPost(req.url,req.params, req.callback, req);
            } else {
                log.d("httptimeout");
            }
        }
        xhr.onerror = function (err) {
            log.e(err);
            req.tryindex++;
            log.d("onerror tryindex:"+req.tryindex);
            if (req.tryindex < req.trycount) {
                HttpUtils.httpPost(req.url,req.params, req.callback, req);
            } else {
                log.d("httperror");
            }

        }
    }

    public static downloadRemoteFile(url: string, callback: (data: any) => void, req?: any){
        let xhr = new XMLHttpRequest();
        if (req == null) {
            req = {};
            req.timeout = req.timeout ? req.timeout : TIMEOUT;
            req.callback = callback;
            req.url = url;
            req.tryindex = 0;
            req.responseType = 'arraybuffer';
            req.trycount = HTTP_TRY_COUNT;
            req.xhr = xhr;
        }
        xhr.onreadystatechange = function () {
            log.d('===downloadRemoteFile xhr.readyState='+xhr.readyState+'  xhr.status='+xhr.status);
            if (xhr.readyState === 4 && xhr.status >= 200) {
                log.d("====downloadRemoteFile response:" + xhr.response);
                callback(xhr.response);
            }else{
                if (xhr.status === 404) {
                    log.d('404 page not found!');
                } else if (xhr.readyState === 3) {
                    log.d('Request dealing!');
                } else if (xhr.readyState === 2) {
                    log.d('Request received!');
                } else if (xhr.readyState === 1) {
                    log.d('Server connection established! Request hasn\'t been received');
                } else if (xhr.readyState === 0) {
                    log.d('Request hasn\'t been initiated!');
                }
            }
        };
        xhr.ontimeout = function () {
            req.tryindex++;
            if (req.tryindex < req.trycount) {
                HttpUtils.httpGet(req.url, req.callback, req);
            } else {
                log.d("httptimeout");
                callback(null)
            }
        }
        xhr.onerror = function (err) {
            log.d(err);
            req.tryindex++;
            log.d("onerror tryindex:"+req.tryindex);
            if (req.tryindex < req.trycount) {
                HttpUtils.httpGet(req.url, req.callback, req);
            } else {
                log.d("httperror");
                callback(null);
            }
        }
        xhr.open("GET", url, true);
        xhr.timeout = req.timeout;
        xhr.responseType = req.responseType;
        xhr.send();
    }
}
