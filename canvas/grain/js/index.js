;
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz', 'ms'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

;
(function() {
    var grain = function(opt) {
        this.init(opt);
    }
    grain.prototype = {
        constructor: grain,
        init: function(opt) {
            this.cwidth = this._getPageArea().width;
            this.cheight = this._getPageArea().height;
            this.particles = [];
            this.start = {
            	x : this.cwidth / 2,
            	y : this.cheight 
            }
            this.createCanvas();
        },
        _getPageArea: function() {
            if (document.compatMode == "BackCompat") {
                return {
                    width: Math.max(document.body.scrollWidth, document.body.clientWidth),
                    height: Math.max(document.body.scrollHeight, document.body.clientHeight)
                }
            } else {
                return {
                    width: Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth),
                    height: Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight)
                }
            }
        },
        createCanvas: function() {

            this.box = document.createElement('canvas');
            if (!this.box.getContext) {
                fnNoSupport();
                console.log('傻逼，你的浏览器不支持canvas!');
                return;
            }
            this.context = this.box.getContext('2d');
            this.box.width = this.cwidth;
            this.box.height = this.cheight;
            // this.box.style.zIndex = Date.now();
            this.box.style.position = "fixed";
            this.box.style.top = "0";
            this.box.style.left = "0";

            var oBody = document.getElementsByTagName('body')[0];
            oBody.appendChild(this.box);
            this.initCanvas();
        },
        initCanvas: function() {
            var _self = this;
            var img = new Image(); // 创建img元素
            img.onload = function() {
                // 执行drawImage语句
                // _self.context.drawImage(img,0,0,200,200,
                // 						Math.floor((_self.cwidth - 200) / 2) ,
                // 						Math.floor((_self.cheight - 200) / 2),
                // 						1920,
                // 						1205);
                // TODO set Img box
                _self.img = {
                	w: 200,
                	h: 200
                }
                _self.context.drawImage(img,
                						200,0,
                						img.height,
                						img.height,
                						Math.floor((_self.cwidth - _self.img.w) / 2) ,
                						Math.floor((_self.cheight - _self.img.h) / 2),
                						_self.img.w,
                						_self.img.h);

                _self.render();
            }
            img.src = './img/logo2.png'; // 设置图片源地址
        },
        render:function(){
        	var _self = this;
        	var rows = 200, //行
        		cols = 200; //列
        		//横行竖列
    		_self.imgPos = {
    			x: Math.floor((_self.cwidth - _self.img.w) / 2),
    			y: Math.floor((_self.cheight - _self.img.h) / 2)
    		}

        	var s_width = parseInt(_self.img.w/rows,10),
        		s_height = parseInt(_self.img.h/cols,10);

        	var data = _self.context.getImageData(_self.imgPos.x, _self.imgPos.y, _self.img.w, _self.img.h).data,
        		dataColor = [],
        		pos = 0;
        	// return;
        	for (var di = 0; di < data.length; di+=4) {
        		dataColor.push('rgba('+data[di] + ',' + data[di+1] +',' + data[di+2] +','+ data[di+3]/255+')');
        	}
        	for (var i = 0; i < rows ; i++) {
        		for (var j = 0; j < cols ; j++) {
        			pos = [(j * s_height - 1) * _self.img.w + ( i * s_width - 1) ]*4;
        			// console.log(data[pos]);
        			if(data[pos] < 300){
        				var particle = {
        					x : _self.imgPos.x + (i+1) * s_width+(Math.random()*10 - 2),// +(Math.random()*10 - 2)
        					y : _self.imgPos.y + (j+1) * s_height+(Math.random()*10 - 2),// +(Math.random()*10 - 2)
        					delay: Math.random() * 2000 , 
        					duration : 3000,
        					count: 0,
        					fillstyle : dataColor[j * rows + i]
        				}
        				_self.particles.push(particle);
        			}
        		}
        	}

        	function draw(){
        		_self.step();
        		_self.requestId = window.requestAnimationFrame(draw);
        	}
        	_self.beginTime = Date.now();
        	_self.requestId = window.requestAnimationFrame(draw);
        },
        step : function(){
        	var _self = this;
        	_self.context.fillStyle = '#0C1328';
        	_self.context.fillRect(0, 0, _self.cwidth, _self.cheight);
        	var log = document.getElementById('show_log');
        	var all_time = 0;
        	for (var i = 0, l = _self.particles.length; i < l; i++) {
        		var cur_p = _self.particles[i];
        		var cur_x = _self.start.x,
        			cur_y = _self.start.y;

        		var noTime = Date.now();

        		if(cur_p.delay + cur_p.duration > all_time) all_time = cur_p.delay + cur_p.duration;
        		
        		var cur_difference = Math.floor(noTime - _self.beginTime) ;
				// console.log(cur_p.delay );
        		if(cur_difference > cur_p.delay ){

        			_self.context.fillStyle = cur_p.fillstyle;

					var cur_time = cur_p.delay + cur_p.duration;
					if(i == l -1 && cur_p.count >= all_time ){
	        			window.cancelAnimationFrame(_self.requestId);
	        			return;
					}
					cur_d = cur_p.duration;
					// if( _self.start.x <= cur_p.x ) {
					// 	cur_x = cur_x + (cur_p.x / cur_d) * ((cur_difference - cur_p.delay));

					// 	if(cur_x >= cur_p.x) cur_x = cur_p.x;
					// }else{
					// 	cur_x = cur_x - (cur_p.x / cur_d) * ((cur_difference - cur_p.delay));

					// 	if(cur_x <= cur_p.x) cur_x = cur_p.x;
					// }

					// if(_self.start.y <= cur_p.y){
					// 	cur_y = cur_y + (cur_p.y / cur_d) * ((cur_difference - cur_p.delay));

					// 	if(cur_y >= cur_p.y)  cur_y = cur_p.y;
					// }else{
					// 	cur_y = cur_y - (cur_p.y / cur_d) * ((cur_difference - cur_p.delay));

					// 	if(cur_y <= cur_p.y)  cur_y = cur_p.y;
					// }
					if(cur_difference < cur_d + cur_p.delay){
						//easeOutElastic
						cur_x = easeInOutExpo((cur_difference - cur_p.delay),_self.start.x,(cur_p.x - _self.start.x),cur_d);
						cur_y = easeInOutExpo((cur_difference - cur_p.delay),_self.start.y,(cur_p.y - _self.start.y),cur_d);
					}else{
						cur_x = cur_p.x;
						cur_y = cur_p.y;
					}

					_self.context.fillRect(cur_x,cur_y,1,1);
					
        		}
        	}
        }
    }

    function fnNoSupport() {
        var sup = document.createElement('div');
        sup.setAttribute('class', 'no-support');
        sup.innerHTML = '傻逼，你的浏览器不支持canvas!';
        document.getElementsByTagName('body')[0].appendChild(sup);
    }

    var linear = function(e, a, g, f) {
            return g * e / f + a
        },
        easeInOutQuad = function(e, a, g, f) {
            e /= f / 2;
            if (e < 1) {
                return g / 2 * e * e + a
            }
            e--;
            return -g / 2 * (e * (e - 2) - 1) + a
        },
        easeOutQuad = function(e, a, g, f) {
            e /= f;
            return -g * e * (e - 2) + a
        },
        easeInCubic = function(e, a, g, f) {
            e /= f;
            return g * e * e * e + a
        },
        easeOutCubic = function(e, a, g, f) {
            e /= f;
            e--;
            return g * (e * e * e + 1) + a
        },
        easeInOutCubic = function(e, a, g, f) {
            e /= f / 2;
            if (e < 1) {
                return g / 2 * e * e * e + a
            }
            e -= 2;
            return g / 2 * (e * e * e + 2) + a
        },
        easeInQuart = function(e, a, g, f) {
            e /= f;
            return g * e * e * e * e + a
        },
        easeOutQuart = function(e, a, g, f) {
            e /= f;
            e--;
            return -g * (e * e * e * e - 1) + a
        },
        easeInOutQuart = function(e, a, g, f) {
            e /= f / 2;
            if (e < 1) {
                return g / 2 * e * e * e * e + a
            }
            e -= 2;
            return -g / 2 * (e * e * e * e - 2) + a
        },
        easeInQuint = function(e, a, g, f) {
            e /= f;
            return g * e * e * e * e * e + a
        },
        easeOutQuint = function(e, a, g, f) {
            e /= f;
            e--;
            return g * (e * e * e * e * e + 1) + a
        },
        easeInOutQuint = function(e, a, g, f) {
            e /= f / 2;
            if (e < 1) {
                return g / 2 * e * e * e * e * e + a
            }
            e -= 2;
            return g / 2 * (e * e * e * e * e + 2) + a
        },
        easeInSine = function(e, a, g, f) {
            return -g * Math.cos(e / f * (Math.PI / 2)) + g + a
        },
        easeOutSine = function(e, a, g, f) {
            return g * Math.sin(e / f * (Math.PI / 2)) + a
        },
        easeInOutSine = function(e, a, g, f) {
            return -g / 2 * (Math.cos(Math.PI * e / f) - 1) + a
        },
        easeInExpo = function(e, a, g, f) {
            return g * Math.pow(2, 10 * (e / f - 1)) + a
        },
        easeOutExpo = function(e, a, g, f) {
            return g * (-Math.pow(2, -10 * e / f) + 1) + a
        },
        easeInOutExpo = function(e, a, g, f) {
            return g * (-Math.pow(2, -10 * e / f) + 1) + a
        },
        easeInCirc = function(e, a, g, f) {
            e /= f;
            return -g * (Math.sqrt(1 - e * e) - 1) + a
        },
        easeOutCirc = function(e, a, g, f) {
            e /= f;
            e--;
            return g * Math.sqrt(1 - e * e) + a
        },
        easeInOutCirc = function(e, a, g, f) {
            e /= f / 2;
            if (e < 1) {
                return -g / 2 * (Math.sqrt(1 - e * e) - 1) + a
            }
            e -= 2;
            return g / 2 * (Math.sqrt(1 - e * e) + 1) + a
        },
        easeInOutElastic = function(g, e, k, j, f, i) {
            if (g == 0) {
                return e
            }
            if ((g /= j / 2) == 2) {
                return e + k
            }
            if (!i) { i = j * (0.3 * 1.5) }
            if (!f || f < Math.abs(k)) {
                f = k;
                var h = i / 4
            } else {
                var h = i / (2 * Math.PI) * Math.asin(k / f)
            }
            if (g < 1) {
                return -0.5 * (f * Math.pow(2, 10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i)) + e
            }
            return f * Math.pow(2, -10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i) * 0.5 + k + e
        },
        easeInElastic = function(g, e, k, j, f, i) {
            if (g == 0) {
                return e
            }
            if ((g /= j) == 1) {
                return e + k
            }
            if (!i) { i = j * 0.3 }
            if (!f || f < Math.abs(k)) {
                f = k;
                var h = i / 4
            } else {
                var h = i / (2 * Math.PI) * Math.asin(k / f)
            }
            return -(f * Math.pow(2, 10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i)) + e
        },
        easeOutElastic = function(g, e, k, j, f, i) {
            if (g == 0) {
                return e
            }
            if ((g /= j) == 1) {
                return e + k
            }
            if (!i) { i = j * 0.3 }
            if (!f || f < Math.abs(k)) {
                f = k;
                var h = i / 4
            } else {
                var h = i / (2 * Math.PI) * Math.asin(k / f)
            }
            return (f * Math.pow(2, -10 * g) * Math.sin((g * j - h) * (2 * Math.PI) / i) + k + e)
        },
        easeInOutBack = function(e, a, h, g, f) {
            if (f == undefined) { f = 1.70158 }
            if ((e /= g / 2) < 1) {
                return h / 2 * (e * e * (((f *= (1.525)) + 1) * e - f)) + a
            }
            return h / 2 * ((e -= 2) * e * (((f *= (1.525)) + 1) * e + f) + 2) + a
        },
        easeInBack = function(e, a, h, g, f) {
            if (f == undefined) { f = 1.70158 }
            return h * (e /= g) * e * ((f + 1) * e - f) + a
        },
        easeOutBack = function(e, a, h, g, f) {
            if (f == undefined) { f = 1.70158 }
            return h * ((e = e / g - 1) * e * ((f + 1) * e + f) + 1) + a
        };


    new grain();
})();
