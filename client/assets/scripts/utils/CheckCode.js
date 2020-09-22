var DICT = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
	            'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
	            '1','2','3','4','5','6','7','8','9','0']
	var FONT_COLOR = [new cc.Color(0, 0, 0, 255), new cc.Color(0xff, 0, 0, 255), new cc.Color(0, 0xff, 0, 255), new cc.Color(0, 0, 0xff, 255)]
	var FONT_SIZE_RANGE = [35, 45]
	var WIDTH_OFFSET_RANGE = [30, 40]; //宽度距范围值
	var HEIGHT_OFFSET_RANGE = [-10, 10]
	var DOT_NUM = 20  //干扰点数量
	var LINE_NUM = 3  //干扰线数量
	var TILT = 40;				//x,y轴总的倾斜量
	var TILT_LINE_WIDTH = [1,2];		//干扰线宽度

var CheckCode = cc.Class({
	extends:  cc.Component,
    properties: {
		codeLen : {type : cc.Integer,default : 4,},
    },
	
	onLoad()
	{
		this.code = ""
		this.codeLab = {}
		this.nodeArr = [];
		this.initCheckCode()
		this.initBtn();
	},

	onDestroy()
	{
	},

	initData(codeLen)
	{
		this.codeLen = codeLen || 4     //验证码长度
	},
	
	initCheckCode(){
	    this.createCode()
	},

	initBtn()
	{
		util.addClickCallBack(this.node, handler(this, function(){
				//重新生成验证码
			this.initCheckCode()
		}))
	},
	
	//生成验证码
	createCode(){
		this.reset();

		for(var i = 0; i < this.codeLen; ++i)
		{
			var str = DICT[util.randomInt(0, DICT.length - 1)]
			this.code = this.code + str
			this.codeLab[i] = this.createCodeLab(str, i)
		}

	    this.drawDot()
	    this.drawLine()
	},
	
	createCodeLab(code, index){
	    var fontSize = this.getFontSize()
		var uiText = display.newLabel(code, fontSize);
		uiText.useSystemFont  = true;
	    var color = this.getRandomFontColor()
	    uiText.node.color = color
	    this.isEnableItalics(uiText)
	    uiText.node.position = cc.v2(20 + index * this.getWidthOffset(), this.node.height / 2 + this.getHeightOffset())
		this.node.addChild(uiText.node)
		this.nodeArr.push(uiText.node)
		
	    return uiText
	},
	
	//设置字体大小范围
	setFontRange(minSize, maxSize){
	    FONT_SIZE_RANGE = {minSize, maxSize}
	},
	
	getFontSize(){
	    return util.randomInt(FONT_SIZE_RANGE[0], FONT_SIZE_RANGE[1])
	},
	
	//设置宽度间隙范围
	setWidthOffsetRange(minOffset, maxOffset){
	    WIDTH_OFFSET_RANGE = {minOffset, maxOffset}
	},
	
	getWidthOffset(){
	    return util.randomInt(WIDTH_OFFSET_RANGE[0], WIDTH_OFFSET_RANGE[1])
	},
	
	//设置高度间隙范围
	setHeightOffsetRange(minOffset, maxOffset){
	    HEIGHT_OFFSET_RANGE = {minOffset, maxOffset}
	},
	
	getHeightOffset(){
	    return util.randomInt(HEIGHT_OFFSET_RANGE[0], HEIGHT_OFFSET_RANGE[1])
	},
	
	//文字的颜色
	getRandomFontColor(){
	    return FONT_COLOR[util.randomInt(0, FONT_COLOR.length - 1)]
	},
	
	//是否斜体
	isEnableItalics(lab){
	    if (util.randomInt(0, 100) % 3 == 0 ){
			var tilt1 = util.randomInt(0, TILT)
			var tilt2 = TILT - tilt1;
			lab.node.skewX = tilt1;
			lab.node.skewY = tilt2;
	    }
	},
	
	
	//是否加粗
	isEnableBold(lab){
	    if (util.randomInt(100) % 3 == 0 ){
			lab._isBold = true;
	        // lab.enableBold()
	    }
	},
	
	//获取验证码字符串
	getCode(){
	    return this.code
	},

	//画干扰线
	drawLine()
	{
		var drawNode = this.node.getComponent(cc.Graphics)
		for (let i = 0; i < LINE_NUM; i++)
		{
			drawNode.moveTo(util.randomInt(10, this.node.width - 10), util.randomInt(10, this.node.height - 10));
			drawNode.lineTo(util.randomInt(10, this.node.width - 10), util.randomInt(10, this.node.height - 10));

			drawNode.stroke();
		}
	},

	//画干扰点
	drawDot()
	{
		var drawNode = this.node.getComponent(cc.Graphics)
		for (let i = 0; i < DOT_NUM; i++)
		{
			drawNode.circle(util.randomInt(5, this.node.width - 5), util.randomInt(5, this.node.height - 5), 2)
			drawNode.fill();
		}
	},

	reset()
	{
		this.code = "";
		for(var i = 0; i < this.nodeArr.length; ++i)
		{
			this.nodeArr[i].destroy();
		}
		this.nodeArr = [];

		var drawNode = this.node.getComponent(cc.Graphics)
		drawNode.clear();
	},
	
})
module.exports = CheckCode
