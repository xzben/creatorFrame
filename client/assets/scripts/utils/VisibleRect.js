
var VisibleRect = cc.Class({
	properties: {
        s_visibleRect : null,
	},

	ctor()
	{
        this.s_visibleRect = new cc.Rect(0, 0, 0, 0)
	},

    lazyInit(){
        if (this.s_visibleRect.width == 0.0 && this.s_visibleRect.height == 0.0) 
        {
            var size = cc.winSize
            this.s_visibleRect.x = 0
            this.s_visibleRect.y = 0
            this.s_visibleRect.width  = size.width
            this.s_visibleRect.height = size.height
        }
    },

    getVisibleSize()
    {
        this.lazyInit()
        return new cc.Size(this.s_visibleRect.width, this.s_visibleRect.height)
    },

    getVisibleRect()
    {
        this.lazyInit()
        return new cc.Rect(this.s_visibleRect.x, this.s_visibleRect.y, this.s_visibleRect.width, this.s_visibleRect.height)    
    },

    left()
    {
        this.lazyInit()
        return cc.v2(this.s_visibleRect.x, this.s_visibleRect.y+this.s_visibleRect.height/2)  
    },

    right()
    {
        this.lazyInit()
        return cc.v2(this.s_visibleRect.x+this.s_visibleRect.width, this.s_visibleRect.y+this.s_visibleRect.height/2)    
    },

    top()
    {
        this.lazyInit()
        return cc.v2(this.s_visibleRect.x+this.s_visibleRect.width/2, this.s_visibleRect.y+this.s_visibleRect.height)
    },

    bottom()
    {
        this.lazyInit()
        return cc.v2(this.s_visibleRect.x+this.s_visibleRect.width/2, this.s_visibleRect.y)
    },

    center()
    {
        this.lazyInit()
        return cc.v2(this.s_visibleRect.x+this.s_visibleRect.width/2, this.s_visibleRect.y+this.s_visibleRect.height/2)
    },

    leftTop()
    {
        this.lazyInit()
        return cc.v2(this.s_visibleRect.x, this.s_visibleRect.y+this.s_visibleRect.height)
    },

    rightTop()
    {
        this.lazyInit()
        return cc.v2(this.s_visibleRect.x+this.s_visibleRect.width, this.s_visibleRect.y+this.s_visibleRect.height)
    },

    leftBottom()
    {
        this.lazyInit()
        return cc.v2(this.s_visibleRect.x,this.s_visibleRect.y)
    },


    rightBottom()
    {
        this.lazyInit()
        return cc.v2(this.s_visibleRect.x+this.s_visibleRect.width, this.s_visibleRect.y)
    },

})

let visibleRect = new VisibleRect()
module.exports = visibleRect