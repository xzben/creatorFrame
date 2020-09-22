
var HttpUtils = cc.Class({
    name : "HttpUtils",

    ctor: function () {

    },

    httpGet(url, callback) {
        var tagetUrl = ""
        if (platform.getInstance().isWin32Platform()) {//不是手机端
            tagetUrl = platform.getInstance().getProxyServerUrl() + "/?url=" + util.Base64.encodeBase64(url)
        } else {
            tagetUrl = url
        }
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            // log.d('===httpGet xhr.readyState='+xhr.readyState+'  xhr.status='+xhr.status);
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0)) {
                // log.d("====httpGet responseText:" + xhr.responseText);
                callback(xhr.responseText);
            }
        };

        log.d("=====httpGet====", tagetUrl)
        xhr.open("GET", tagetUrl);
        xhr.timeout = 5000;// 5 seconds for timeout
        xhr.send();
    },

    httpPost(url, params, callback) {
        var xhr = cc.loader.getXMLHttpRequest();
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

        xhr.timeout = 5000;// 5 seconds for timeout
        xhr.send(params);
    }
})

module.exports = frame.InstanceMgr.createInstance(HttpUtils);
