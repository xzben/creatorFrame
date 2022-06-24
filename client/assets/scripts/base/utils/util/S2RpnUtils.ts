
export class S2RpnUtils{
    private static m_postfixMap:Map<string, Array<any>> = new Map();
    //符号优先级判断
    private static Priority(value:string):number{
        let i = -1;
        switch(value){
            case'(':i=1;break;
            case'+':i=2;break;
            case'-':i=2;break;
            case'*':i=4;break;
            case'/':i=4;break;
            case'%':i=4;break;
            case'√':i=5;break;
            case'^':i=5;break;
            case')':i=10;break;
            default:i=-1;break;
        }
        return i;
    }
    
    //逆波兰函数
    //字符串表达式转后缀表达式
    private static express2Postfix(express:string) {
        let postfixArr:Array<any> = []; //放逆波兰结果，后缀表达式
        let operArr:Array<any> = [];
        let expressArr = express.split("");//转为数组类型
        let tempNum = "";//暂时存放数字,必须要赋值，否则就是undefined类型

        for(let i = 0; i < expressArr.length; i++){
            let code = express.charCodeAt(i)
            while((code >= 48 && code <= 79) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || expressArr[i] == ".") {
                tempNum += expressArr[i];                    //eval可将字符串转化为代码执行
                i++;
                code = express.charCodeAt(i)
                if(!((code >= 48 && code <= 79) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || expressArr[i] == ".")){  //isNaN 表示不是一个数字
                    postfixArr.push(tempNum);
                    tempNum = "";
                    break;
                }  
            }

            while( !isNaN(Number(expressArr[i])) ||expressArr[i] == "."){				
                tempNum += expressArr[i];                    //eval可将字符串转化为代码执行
                i++;
                if(isNaN(Number(expressArr[i]))  && expressArr[i] != "."){  //isNaN 表示不是一个数字
                    postfixArr.push(tempNum);
                    tempNum = "";
                    break;
                }               
            }
            if (i < expressArr.length) {
                if(expressArr[i] == "("){
                    operArr.push(expressArr[i]);  
                }
                else if(expressArr[i] == ")"){
                    while(operArr[operArr.length-1] != "("){
                        postfixArr.push(operArr[operArr.length-1]); 
                        operArr.pop();
                    }
                    if(operArr[operArr.length-1] == "("){
                        operArr.pop();
                    }
                }
                else if(operArr.length == 0 || this.Priority(expressArr[i]) > this.Priority(operArr[operArr.length-1]))  //Priority(expressArr[i]);//运行了
                {
                    operArr.push(expressArr[i]);	
                }
                else{
                    while(this.Priority(expressArr[i]) <= this.Priority(operArr[operArr.length-1])){
                        postfixArr.push(operArr[operArr.length-1]);
                        operArr.pop();
                        if(operArr.length == 0)
                        {
                            break;
                        }
                    }
                    operArr.push(expressArr[i]);
                }
            }
            
        }

        while(operArr.length != 0){
            postfixArr.push(operArr[operArr.length-1]);
            operArr.pop();
        }
        // console.log("逆波兰表达式：" + postfixArr);
        return postfixArr;
    }
    

     //计算后缀表达式结果
     private static computePostfix(postfix:Array<any>, object:any|null) {
        let result = 0;
        let s1:Array<any> = [];
        object = object || {};
        for (let i = 0; i < postfix.length; i++) {
            var o = postfix[i];
            if (!isNaN(o)) {
                s1.push(Number(o));
            } else {
                switch (o) {
                    case '+':
                        var p = s1.pop();     
			            var s = s1.pop();  
                        result = s + p;
                        break;
                    case '-':
                        var p = s1.pop();     
			            var s = s1.pop();  
                        result = s - p;
                        break;
                    case '*':
                        var p = s1.pop();     
			            var s = s1.pop();  
                        result = s * p;
                        break;
                    case '/':
                        var p = s1.pop();     
			            var s = s1.pop();  
                        result = s / p;
                        break;
                    case '%':
                        var p = s1.pop();     
			            var s = s1.pop();  
                        result = s % p;
                        break;
                    case '√':
                        result = Math.sqrt(s1.pop());
                        break;
                    case '^':
                        var p = s1.pop();     
			            var s = s1.pop(); 
                        result = Math.pow(s, p);
                        break;
                    default:
                        result = object[o] || 0;
                        break;
                }
                s1.push(result);
            }   
        }
        return s1[0];
    }

    /*
        四则运算公式
        expression:运算表达式3*X+Y%2、   
        支持+、-、*、/
        %[支持取余]、
        √[支持平方根]、
        ^[支持幂运算]、
        ()[支持小括号]
      示例：dal2Rpn("10%aa+(aa-bb)*cc/(dd*√4)", {aa:3, bb:-2, cc:10, dd:2})
            console.log(10%3+(3+2)*10/(2*Math.sqrt(4)))
    */
    public static dal2Rpn(expression:string, object:any|null){
        let arrPrefix = this.m_postfixMap.get(expression);
        if (!arrPrefix) {
            let expression_temp = expression.replace(/ /g, "");
            arrPrefix = this.express2Postfix(expression_temp);
            this.m_postfixMap.set(expression, arrPrefix);
        }
        let value = this.computePostfix(arrPrefix, object);
        return value;
    }

}