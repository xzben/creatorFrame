import * as cc from "cc"

enum READ_FILE_TYPE {
    DATA_URL,// readAsDataURL, base64
    TEXT,// readAsText
    BINARY,// readAsBinaryString
    ARRAYBUFFER,// readAsArrayBuffer
}

export class FileUtils{
 /**
     * 打开文件选择器
     *
     * @param {string} accept
     * @param {(file: File) => void} callback
     * @memberof FileMgr
     */
  public static openLocalFile(accept: string, callback: (file: File) => void) {
        let inputEl: HTMLInputElement = <HTMLInputElement>document.getElementById('file_input');
        if (!inputEl) {
            // console.log('xxxxxx createElement input');
            inputEl = document.createElement('input');
            inputEl.id = 'file_input';
            inputEl.setAttribute('id', 'file_input');
            inputEl.setAttribute('type', 'file');
            inputEl.setAttribute('class', 'fileToUpload');
            inputEl.style.opacity = '0';
            inputEl.style.position = 'absolute';
            inputEl.setAttribute('left', '-999px');
            document.body.appendChild(inputEl);
        }

        accept = accept || ".*";
        inputEl.setAttribute('accept', accept);

        inputEl.onchange = (event) => {
            let files = inputEl.files
            if (files && files.length > 0) {
                var file = files[0];
                if (callback) callback(file);
            }
        }
        inputEl.click();
    }

    /**
     * 读取本地文件数据
     *
     * @param {File} file
     * @param {READ_FILE_TYPE} readType
     * @param {((result: string | ArrayBuffer) => void)} callback
     * @memberof FileMgr
     */
    public static readLocalFile(file: File, readType: READ_FILE_TYPE, callback: (result: string | ArrayBuffer) => void) {
        var reader = new FileReader();
        reader.onload = function (event) {
            if (callback) {
                if (reader.readyState == FileReader.DONE) {
                    callback(reader.result!);
                } else {
                    callback(null!);
                }
            }
        };
        switch (readType) {
            case READ_FILE_TYPE.DATA_URL:
                reader.readAsDataURL(file);
                break;
            case READ_FILE_TYPE.TEXT:
                reader.readAsText(file);   //作为字符串读出
                //reader.readAsText(file,'gb2312');   //默认是用utf-8格式输出的，想指定输出格式就再添加一个参数，像txt的ANSI格式只能用国标才能显示出来
                break;
            case READ_FILE_TYPE.BINARY:
                reader.readAsBinaryString(file);
                break;
            case READ_FILE_TYPE.ARRAYBUFFER:
                reader.readAsArrayBuffer(file);
                break;
        }
    }

    /**
     * 保存数据到本地
     *
     * @param {*} textToWrite       要保存的文件内容
     * @param {*} fileNameToSaveAs  要保存的文件名
     * @memberof FileMgr
     */
    public static saveForBrowser(textToWrite : string, fileNameToSaveAs : string) {    
        if (cc.sys.isBrowser) { 
            console.log("浏览器");        
            let textFileAsBlob = new Blob([textToWrite], {type:'text/plain;charset=utf-8'});   
            let downloadLink = document.createElement("a");        
            downloadLink.download = fileNameToSaveAs;        
            downloadLink.innerHTML = "Download File";        
            if (window.webkitURL != null){            
                // Chrome allows the link to be clicked            
                // without actually adding it to the DOM.            
                downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);        
            }else{            
                // Firefox requires the link to be added to the DOM            
                // before it can be clicked.            
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);            
                // downloadLink.onclick = destroyClickedElement;            
                downloadLink.style.display = "none";            
                document.body.appendChild(downloadLink);        
            }
            downloadLink.click();    
        } 
    }

        /**
     * 保存数据到本地
     *
     * @param {*} data   要保存的文件内容 支持 ArrayBuffer | string
     * @param {*} model  打开文件模式
     * @param {*} fullPath  要保存的文件路径+文件名
     * @memberof FileMgr
     */
    public static saveDataForNative(data : ArrayBuffer | string, fullPath : string, model : string = 'wb'){
        if(cc.sys.isNative){
            let myGlobal : any = window;
            let myjsb = myGlobal.myjsb;
            if (myjsb) {
                let ret = myjsb.MyFileUtils.getInstance().writeDataToFile(data, model, fullPath);
                return ret;
            }
        }
        return false;
    }
}