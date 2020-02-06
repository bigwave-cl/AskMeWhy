(function() {
	var root = this;

	var previousUnderscore = root._;

	var ArrayProto = Array.prototype,
		ObjProto = Object.prototype,
		FuncProto = Function.prototype;
	var push = ArrayProto.push,
		slice = ArrayProto.slice,
		toString = ObjProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty;

	var _ = function(obj) {
		// if (obj instanceof _) return obj;
		// if (!(this instanceof _)) return new _(obj);
		// this._wrapped = obj;
	};


	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = _;
		}
		exports._ = _;
	} else {
		root._ = _;
	}

	var optimizeCb = function(func, context, argCount) {
		if (context === void 0) return func;
		switch (argCount == null ? 3 : argCount) {
			case 1:
				return function(value) {
					return func.call(context, value);
				};
			case 2:
				return function(value, other) {
					return func.call(context, value, other);
				};
			case 3:
				return function(value, index, collection) {
					return func.call(context, value, index, collection);
				};
			case 4:
				return function(accumulator, value, index, collection) {
					return func.call(context, accumulator, value, index, collection);
				}
		}
		return function() {
			return func.apply(context, arguments);
		}
	}
	var cb = function(value, context, argCount) {
		if (value == null) return _.identity;
		if (_.isFunction(value)) return optimizeCb(value, context, argCount);
		if (_.isObject(value)) return _.matcher(value);
		return _.property(value);
	};

	var property = function(key) {
		return function(obj) {
			return obj == null ? void 0 : obj[key];
		}
	}
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1; //最大的安全整数
	var getLength = property('length');
	var isArrayLike = function(collection) {
		var length = getLength(collection);
		return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	}
	var creatAssingner = function(keysFunc,undefinedOnly){
		return function(obj){
			var length = arguments.length;
			if(length < 2 || obj == null) return obj;
			for(var index = 1; index < length ;index++){
				var source = arguments[index],
					keys = keysFunc(source),
					l = keys.length;
				for (var i = 0; i< l; i++){
					var key = keys[i];
					if( !undefinedOnly || obj[key] === void 0) obj[key] = source[key];
				}
			}
			return obj;
		}
	}
	_.each = _.forEach = function(obj, iteratee, context) {
		iteratee = optimizeCb(iteratee, context);
		var i, length;

		if (isArrayLike(obj)) {
			for (i = 0, length = obj.length; i < length; i++) {
				iteratee(obj[i], i, obj);
			}
		} else {
			var keys = _.keys(obj);
			for (i = 0, length = keys.length; i < length; i++) {
				iteratee(obj[keys[i]], keys[i], obj)
			}
		}
	};
	_.map = _.collect = function(obj,iteratee,context){
		if(!_.isArray(obj)) throw Error("_.map() Support arrays only");
		iteratee = cb(iteratee,context);
		var keys = !isArrayLike(obj) && _.keys(obj),
			length = (keys || obj).length,
			results = Array(length);
		for(var index = 0; index < length; index++){
			var currentKey = keys ? keys[index]:index;
			results[index] = iteratee(obj[currentKey],currentKey,obj);
		}
		return results;
	}

	_.isEmpty = function(obj) {
		if (obj == null) return true;
		if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
		return _.keys(obj).length === 0;
	};
	_.isArray = Array.isArray || function(obj) {
		return toString.call(obj) === '[object Array]';
	};
	_.isObject = function(obj) {
		var type = typeof obj;
		return type === 'function' || type === 'object' && !!obj;
	};
	_.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
		_['is' + name] = function(obj) {
			return toString.call(obj) === '[object ' + name + ']';
		}
	});
	_.keys = function(obj) {
		if (!_.isObject(obj)) return [];
		if (Object.keys) return Object.keys(obj);
		var keys = [];

		for (var key in obj)
			if (_.has(obj, key)) keys.push(key);

		return keys;
	}
	_.allKeys = function(obj) {
		if (!_.isObject(obj)) return [];
		var keys = [];

		for (var key in obj) keys.push(key);

		return keys;
	}
	_.has = function(obj, key) {
		return obj != null && hasOwnProperty.call(obj, key);
	}
	_.identity = function(value) {
		return value;
	}
	_.matcher = _.matches = function(attrs) {
		attrs = _.extendOwn({}, attrs);
		return function(obj) {
			return _.isMatch(obj, attrs);
		}
	}
	_.property = property;
	_.extend = creatAssingner(_.allKeys);
	_.extendOwn = _.assign = creatAssingner(_.keys);

}).call(this);
