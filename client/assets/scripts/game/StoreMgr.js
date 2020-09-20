let Store = cc.Class({
	name: "Store",

	cotr(){
	},

	init(){

	},
	
	getBoolValue(key, def){
		var value = cc.sys.localStorage.getItem(key);
		cc.log("################# getBoolValue",key, value)
		if( value)
		{
			value = parseInt(value) == 1;
		}
		else
		{
			value = def;
		}

		return value;
	},

	setBoolValue(key, value){
		cc.sys.localStorage.setItem(key, value ? 1 : -1 );
	},

	getIntValue(key, def){
		var value = cc.sys.localStorage.getItem(key);
		if(value){
			value = parseInt(value);
		}
		else{
			value = def;
		}
		return value;
	},

	setIntValue(key, value){
		log.d("################## setIntValue", key, value)
		cc.sys.localStorage.setItem(key, value);
	},

	getFloatValue(key, def){
		var value = cc.sys.localStorage.getItem(key);
		if(value){
			value = parseFloat(value);
		}else{
			value = def;
		}
		return value;
	},

	setFloatValue(key, value){
		cc.sys.localStorage.setItem(key, value);
	},
	
	getStringValue(key, def){
		var value = cc.sys.localStorage.getItem(key);
		if(!value){
			value = def;
		}
		return value;
	},

	setStringValue(key, value){
		cc.sys.localStorage.setItem(key, value);
	},

	setObjectValue(key, object){
		var stringify = JSON.stringify(object || {})
        cc.sys.localStorage.setItem(key, stringify)
        log.d("################## save", key, stringify, object)
	},
	
	getObjectValue(key, def){
		var userData = cc.sys.localStorage.getItem(key)
        var values = JSON.parse(userData || def)
        log.d("################## load", key, userData, values)
	},
})

module.exports = frame.InstanceMgr.createInstance(Store)