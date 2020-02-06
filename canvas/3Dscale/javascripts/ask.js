/*
 * @Author: askMeWhy
 * @Date:   2018-01-10 15:59:07
 * @Last Modified by:   bigWave
 * @Last Modified time: 2018-03-27 16:15:58
 */
;
(function(win) {
	var Ask = function(opt) {
		this.init(opt);
	}
	Ask.prototype = {
		constructor: Ask,
		init: function(opt) {
			if (!opt) return;
			this.$el = isElementNode(opt.el) ? 　opt.el : document.querySelector(opt.el);
			this.nodes = opt.nodes;
			this.particles = [];
			this.paused = true;
			this.floor = -400;
			this.fl = 5;//视图远近最大值
			this.ax = 0;
			this.ay = 0;
			this.az = -.5;
			this.vpX = 0;
			this.vpY = 0;
			this.col = {
				num: 5,
				interval: 50,
				zInterval: 30,
				plie: 0,
				maxPlie: 5
			}
			if(this.nodes.length == 0) {
				console.error('nodes不能为空数组');
				return;
			}
			this.col.plie = Math.ceil(this.nodes.length/Math.pow(this.col.num,2));
			this.createCanvas();
		},
		width: function(value) {
			return handlePostion(this.$el, 'width', value);
		},
		height: function(value) {
			return handlePostion(this.$el, 'height', value);
		},
		createCanvas: function() {
			this.canvas = document.createElement('canvas');
			if (!this.canvas.getContext) {
				canvasNoSupport();
				console.log('傻逼，你的浏览器不支持canvas!');
				return;
			}
			this.context = this.canvas.getContext('2d');
			var z = this.zIndex;
			this.canvas.width = this.width();
			this.canvas.height = this.height();
			this.canvas.className = 'drift-canvas';
			this.canvas.style.zIndex = z;
			this.canvas.style.position = "absolute";
			this.canvas.style.top = "0";
			this.canvas.style.left = "0";
			this.canvas.style.right = "0";
			this.canvas.style.bottom = "0";
			this.$el.appendChild(this.canvas);
			this.vpX = this.canvas.width / 2,
			this.vpY = this.canvas.height / 2,
			CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
			    var min_size = Math.min(w, h);
			    if (r > min_size / 2) r = min_size / 2;
			    // 开始绘制
			    this.beginPath();
			    this.moveTo(x + r, y);
			    this.arcTo(x + w, y, x + w, y + h, r);
			    this.arcTo(x + w, y + h, x, y + h, r);
			    this.arcTo(x, y + h, x, y, r);
			    this.arcTo(x, y, x + w, y, r);
			    this.closePath();
			    return this;
			}
			win.onresize = this.resize.bind(this);
			win.onblur = this.onblur.bind(this);
			win.onfocus = this.onfocus.bind(this);
			this.buildData();
		},
		resize: function() {
			if (this.canvas) {
				this.stop();
				this.canvas.width = this.width();
				this.canvas.height = this.height();
				this.play();
				// this.buildData();
			}
		},
		onblur: function() {
			this.stop();
		},
		onfocus: function() {
			this.play();
		},
		//重新开始
		restart: function() {
			if (this.canvas) return;
			this.createCanvas();
		},
		//清除
		clear: function() {
			if (this.canvas == null) return;
			this.canvas.remove();
			this.paused = false;
			this.canvas = null;
			this.context = null;
			win.onresize = null;
			win.onblur = null;
			win.onfocus = null;
		},
		//停止
		stop: function() {
			if (this.paused) return;
			this.paused = true;
		},
		//重新开始
		play: function() {
			if (!this.paused) return;
			this.paused = false;
			this.draw();
		},
		getRadiationArray(num,interval){
			var isEvenNum = !Boolean(num%2);
			var baseNum = Math.floor(num/2);
			var arr = [];
			for(var j = baseNum,k = isEvenNum ? 2 : 1; j >= k ; j--){
				arr.push(j*interval);
			}
			if(isEvenNum){
				arr.push(interval);
			}
			for(var i = isEvenNum ? 2 : 1,l = baseNum; i <= l ; i++){
				arr.push(i*interval);
			}
			return arr;
		},
		addNum(num){
			if(num == 1){
				return num;
			}else{
				return num + this.addNum(num - 1);
			}
		},
		getStaticArr(n,isEvenNum){
			var _maxL = 2*n - 1;
			var arr = [];
			for(var i = 1, l = _maxL; i <= l ; i ++){
				for(var j = 1, k = _maxL; j <= k ; j ++){
					if(!isEvenNum || i != n || j!= n ){
						if(i == 1 || i == _maxL || j == 1 ||  j == _maxL){
							arr.push([i,j,10])
						}else{
							arr.push([i,j,20])
						}
					}
				}
			}
			return arr;
		},
		buildData:function(){

			var rArr = this.getRadiationArray(this.col.num,120);
			var isEvenNum = !Boolean(this.col.num%2);
			var baseNum = Math.floor(this.col.num/2);
			var stopScaleArr = this.getStaticArr(baseNum,isEvenNum);

			var intervalAll = rArr.reduce(function(sum,a){
				return sum+a;
			},0);
			var xAll = 0,yAll = 0,maxSize = Math.min(this.col.plie,this.col.maxPlie);
			for(var cur ,curNode,i = 0, l = maxSize * Math.pow(this.col.num,2); i < l ; i++){
				curNode = i < this.nodes.length ? this.nodes[i]:this.nodes[this.nodes.length - 1];
				cur = new Particle(this.canvas,this.context,{
					src: curNode.src,
					text: !curNode.time && !curNode.text ? null:curNode.time + '  ' + curNode.text
				});
				var zRow = Math.floor(i / Math.pow(this.col.num,2)),
					xRow = i % this.col.num,
					yRow = Math.floor(i / this.col.num ) - (this.col.num * zRow);
				var _interval = this.col.interval;
				if(xRow == 0) {
					xAll = 0;
					if(yRow == 0){
						yAll = 0;
					}
				}

				if(xRow == 0 && yRow != 0) yAll += rArr[yRow-1];

				cur.xpos = xRow*cur.width + xRow * _interval + xAll;

				cur.xpos = cur.xpos - Math.floor((cur.width * this.col.num + (this.col.num - 1 ) * _interval + intervalAll)/2);

				cur.ypos = yRow * cur.height + yRow * _interval + yAll;

				cur.ypos = cur.ypos  - Math.floor((cur.height * this.col.num + (this.col.num - 1 ) * _interval + intervalAll)/2);
				// cur.ypos -= 300;
				cur.needStopScale = false;
				cur.needStopScaleVal = 0;
				stopScaleArr.forEach(function(arr){
					if(xRow == arr[0] && yRow == arr[1]){
						cur.needStopScale = true;
						cur.needStopScaleVal = arr[2];
					}
				});

				cur.zpos = zRow * this.col.zInterval;

				if(xRow < rArr.length) xAll += rArr[xRow];
				
				this.particles.push(cur);
			}
			this.play();
		},
		draw:function(){
			if (this.requestAnimationID) win.cancelAnimationFrame(this.requestAnimationID);
			if(this.paused) return;
			this.context.clearRect(0, 0, this.width(), this.height());
			this.particles.forEach(this.move.bind(this));
			this.particles.sort(this.zSort);
			this.particles.forEach(function(particle){ particle.draw() });
			this.requestAnimationID = win.requestAnimationFrame(this.draw.bind(this));
		},
		zSort:function(a, b) {
		  return (b.zpos - a.zpos);
		},
		move: function(particle,index) {
			var _p = Math.min(this.col.plie,this.col.maxPlie);

			var maxZ = _p * this.col.zInterval;

			particle.vx = this.ax;
			particle.vy = this.ay;
			particle.vz = this.az;

		  	particle.xpos += particle.vx;
		  	particle.ypos += particle.vy;
		  	particle.zpos += particle.vz;

		  	/*if(particle.ypos < this.floor){
		      	particle.ypos = this.floor;
		 	}*/

		  	if (particle.zpos < -10) {
		    	particle.zpos += maxZ;
		    	particle.staticVal = null;
		  	}
		  	// if (particle.zpos > maxZ ) {
		   //  	particle.zpos -= maxZ;
		  	// }

		  	var scale = (this.fl+10) / (this.fl+10+ particle.zpos);

		  	if(particle.needStopScale && particle.zpos <= particle.needStopScaleVal){
		  		if(particle.staticVal == null){
		  			particle.staticVal = scale;
		  		}
		  		var _offset = particle.staticVal;

	  			particle.scaleX = particle.scaleY = _offset;
	  			particle.x = this.vpX + particle.xpos * scale + (particle.width * scale - particle.width * _offset)/2;
	  			particle.y = this.vpY + particle.ypos * scale + (particle.height * scale - particle.height * _offset)/2;
		  	}else{
		  		particle.scaleX = particle.scaleY = scale;
		  		particle.x = this.vpX + particle.xpos * scale;
		  		particle.y = this.vpY + particle.ypos * scale;
		  		particle.alpha = scale;
		  	}
		  	
		}
	}
	var Particle = function(canvas,context,info){
		this.staticVal = null;
		this.x = 0;
		this.y = 0;
	    this.vx = 0;
	    this.vy = 0;
	    this.vz = 0;
		this.xpos = 0;
		this.ypos = 0;
		this.zpos = 0;
		this.scaleX = 1;
		this.scaleY = 1;
		this.color = 'rgba(255,255,255,1)';
		this.alpha = 1;
		this.lineWidth = 2;
		this.width = 120;
		this.height = 120;
		this.radius = 20;
		this.pattern = '#fff';
		this.imgSource = null;
		var patternCanvas = document.createElement('canvas');
		patternCanvas.width = this.width;
		patternCanvas.height = this.height;
		var patternContext = patternCanvas.getContext('2d');
		image = new Image();
		var that = this;
		image.onload = function() {
			patternContext.clearRect(0, 0, that.width, that.height);
			patternContext.drawImage(this,0,0,this.width,this.height,0,0,that.width,that.height);
	    	that.pattern = context.createPattern(patternCanvas, "no-repeat");
		};
		image.src = info.src;
		this.text = info.text;
		this.draw = function(){
			context.save();
			context.translate(this.x, this.y);
			context.scale(this.scaleX, this.scaleY);
			context.roundRect(0,0,this.width,this.height,this.radius)
			context.lineWidth = this.lineWidth;
			context.strokeStyle = this.color;
			context.stroke();
			context.fillStyle = this.pattern;
			context.fill();
			context.restore();
			
			if(this.text){
				this.drawLog();
			}
		}
		this.drawLog = function() {
			context.font = "24px/1.2 'dqht','Microsoft YaHei',Monospace,Arial,'Helvetica Neue',Helvetica,sans-serif";
			var _text = context.measureText(this.text)

			var textWidth = _text.width,
				textHeight = 24 * 1.2;

			var logWidth = textWidth + 12 + 12,
				logHeight = textHeight + (12 + 12); //()limian弹框的padding高度
			var cur_textLeft = this.x - (logWidth/4) * this.scaleX,
				cur_textTop = this.y - textHeight * this.scaleY;
			
			context.save();
			context.translate(cur_textLeft, cur_textTop);
			context.scale(this.scaleX, this.scaleY);
			context.beginPath();
			context.moveTo((logWidth/2)*.9 - 10, 14);
			context.lineTo((logWidth/2)*.9, 26);
			context.lineTo((logWidth/2)*.9 + 10, 14);
			context.fillStyle = "rgba(255,255,255, .8)";
			context.fill();
			context.roundRect(-12,-logHeight+14,logWidth,logHeight,8);
			context.fillStyle = 'rgba(255,255,255, .8)';
			context.fill();
			context.closePath();

			context.fillStyle = "#333";
			context.fillText(this.text, 0, 0);
			context.restore();
		}
	}
	function handlePostion(elem, name, value) {
		if (isWindow(elem)) {
			return name.indexOf("outer") === 0 ?
				elem["inner" + name] :
				elem.document.documentElement["client" + name.split("outer")[1]];
		}
		if (elem.nodeType === 9) {
			doc = elem.documentElement;

			if (name.indexOf("outer")) name = name.split("outer")[1];
			if (name.indexOf("inner")) name = name.split("inner")[1];

			return Math.max(
				elem.body["scroll" + name], doc["scroll" + name],
				elem.body["offset" + name], doc["offset" + name],
				doc["client" + name]
			);
		}
		return value === undefined ? getStyle(elem, name) : setStyle(elem, name, value);
	}
	var cssNumber = {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	};

	function getStyle(elem, name) {
		var value = win.getComputedStyle(elem, null).getPropertyValue(name);
		if (cssNumber[name]) {
			return Number(value);
		} else {
			return Number(value.split('px')[0]);
		}
	}

	function setStyle(elem, name, value) {
		var type = typeof value;
		if (type === "number") {
			value += cssNumber[name] ? "" : "px";
		}
		elem.style[name] = value;
	}

	function isWindow(obj) {
		return obj != null && obj === obj.window;
	}

	function canvasNoSupport() {
		var sup = document.createElement('div');
		sup.style.position = "absolute";
		sup.style.top = "50%";
		sup.style.left = "50%";
		sup.style[getPrefix('transform')] = "translate(-50%, -50%)";
		sup.innerHTML = '傻逼，你的浏览器不支持canvas!';
		document.getElementsByTagName('body')[0].appendChild(sup);
	}

	function getPrefix(attr) {
		var rtext = "";
		var toUpAttr = attr.charAt(0).toUpperCase() + attr.substr(1, attr.length);
		var divStyle = document.createElement('div').style;
		var attrArray = [attr + '', 'webkit' + toUpAttr, 'Moz' + toUpAttr, 'ms' + toUpAttr, 'O' + toUpAttr];
		for (var i = 0; i < attrArray.length; i++) {
			if (attrArray[i] in divStyle) {
				// 找到以后立刻返回，结束函数
				return rtext = attrArray[i];
			}
		}
		return rtext;
	}

	function isElementNode(node) {
		return node !== void 0 && node.nodeType === 1;
	}

	function random(min, max) {
		min = Number(min);
		max = Number(max);
		if (isNaN(min) || isNaN(max)) return false;
		return min + parseInt(Math.random() * (max - min + 1), 10);
	}

	win.Ask = Ask;

	(function(root) {
		if (typeof define === 'function' && define.amd) {

			// AMD
			define([], function() {
				return Ask;
			});

		} else if (typeof module !== 'undefined' && typeof exports === 'object') {

			// Node.js
			module.exports = Ask;

		} else if (root !== undefined) {

			// Global variable
			root.Ask = Ask;
		}

	})(this);
})(window)
