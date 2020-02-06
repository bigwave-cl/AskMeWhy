/*
 * @Author: askMeWhy
 * @Date:   2017-12-11 16:38:46
 * @Last Modified by:   bigWave
 * @Last Modified time: 2017-12-28 11:58:38
 */
;
(function() {
	function getLen(v) {
		return Math.sqrt(v.x * v.x + v.y * v.y);
	}

	function dot(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y;
	}

	function getAngle(v1, v2) {
		var mr = getLen(v1) * getLen(v2);
		if (mr === 0) return 0;
		var r = dot(v1, v2) / mr;
		if (r > 1) r = 1;
		return Math.acos(r);
	}

	function cross(v1, v2) {
		return v1.x * v2.y - v2.x * v1.y;
	}

	function getRotateAngle(v1, v2) {
		var angle = getAngle(v1, v2);
		if (cross(v1, v2) > 0) {
			angle *= -1;
		}

		return angle * 180 / Math.PI;
	}

	var HandlerAdmin = function(el) {
		this.handlers = [];
		this.el = el;
	};

	HandlerAdmin.prototype.add = function(handler) {
		this.handlers.push(handler);
	}

	HandlerAdmin.prototype.del = function(handler) {
		if (!handler) this.handlers = [];

		for (var i = this.handlers.length; i >= 0; i--) {
			if (this.handlers[i] === handler) {
				this.handlers.splice(i, 1);
			}
		}
	}

	HandlerAdmin.prototype.dispatch = function() {
		for (var i = 0, len = this.handlers.length; i < len; i++) {
			var handler = this.handlers[i];
			if (typeof handler === 'function') handler.apply(this.el, arguments);
		}
	}

	function wrapFunc(el, handler) {
		var handlerAdmin = new HandlerAdmin(el);
		handlerAdmin.add(handler);

		return handlerAdmin;
	}

	var AlloyFinger = function(el, option) {

		this.element = typeof el == 'string' ? document.querySelector(el) : el;

		this.start = this.start.bind(this);
		this.move = this.move.bind(this);
		this.end = this.end.bind(this);
		this.cancel = this.cancel.bind(this);
		this.element.addEventListener("touchstart", this.start, false);
		this.element.addEventListener("touchmove", this.move, false);
		this.element.addEventListener("touchend", this.end, false);
		this.element.addEventListener("touchcancel", this.cancel, false);

		this.preV = { x: null, y: null };
		this.pinchStartLen = null;
		this.zoom = 1;
		this.isDoubleTap = false;

		var noop = function() {};

		this.rotate = wrapFunc(this.element, option.rotate || noop);
		this.touchStart = wrapFunc(this.element, option.touchStart || noop);
		this.multipointStart = wrapFunc(this.element, option.multipointStart || noop);
		this.multipointEnd = wrapFunc(this.element, option.multipointEnd || noop);
		this.pinch = wrapFunc(this.element, option.pinch || noop);
		this.swipe = wrapFunc(this.element, option.swipe || noop);
		this.tap = wrapFunc(this.element, option.tap || noop);
		this.doubleTap = wrapFunc(this.element, option.doubleTap || noop);
		this.longTap = wrapFunc(this.element, option.longTap || noop);
		this.singleTap = wrapFunc(this.element, option.singleTap || noop);
		this.pressMove = wrapFunc(this.element, option.pressMove || noop);
		this.twoFingerPressMove = wrapFunc(this.element, option.twoFingerPressMove || noop);
		this.touchMove = wrapFunc(this.element, option.touchMove || noop);
		this.touchEnd = wrapFunc(this.element, option.touchEnd || noop);
		this.touchCancel = wrapFunc(this.element, option.touchCancel || noop);

		this._cancelAllHandler = this.cancelAll.bind(this);
		window.removeEventListener('scroll', this._cancelAllHandler);

		window.addEventListener('scroll', this._cancelAllHandler);

		this.delta = null;
		this.last = null;
		this.now = null;
		this.tapTimeout = null;
		this.singleTapTimeout = null;
		this.longTapTimeout = null;
		this.swipeTimeout = null;
		this.x1 = this.x2 = this.y1 = this.y2 = null;
		this.preTapPosition = { x: null, y: null };
	};

	AlloyFinger.prototype = {
		start: function(evt) {
			if (!evt.touches) return;
			this.now = Date.now();
			this.x1 = evt.touches[0].pageX;
			this.y1 = evt.touches[0].pageY;
			this.delta = this.now - (this.last || this.now);
			this.touchStart.dispatch(evt, this.element);
			if (this.preTapPosition.x !== null) {
				this.isDoubleTap = (this.delta > 0 && this.delta <= 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - this.y1) < 30);
			}
			this.preTapPosition.x = this.x1;
			this.preTapPosition.y = this.y1;
			this.last = this.now;
			var preV = this.preV,
				len = evt.touches.length;
			if (len > 1) {
				this._cancelLongTap();
				this._cancelSingleTap();
				var v = { x: evt.touches[1].pageX - this.x1, y: evt.touches[1].pageY - this.y1 };
				preV.x = v.x;
				preV.y = v.y;
				this.pinchStartLen = getLen(preV);
				this.multipointStart.dispatch(evt, this.element);
			}
			this._preventTap = false;
			this.longTapTimeout = setTimeout(function() {
				this.longTap.dispatch(evt, this.element);
				this._preventTap = true;
			}.bind(this), 750);
		},
		move: function(evt) {
			if (!evt.touches) return;
			var preV = this.preV,
				len = evt.touches.length,
				currentX = evt.touches[0].pageX,
				currentY = evt.touches[0].pageY;
			this.isDoubleTap = false;
			if (len > 1) {
				var sCurrentX = evt.touches[1].pageX,
					sCurrentY = evt.touches[1].pageY
				var v = { x: evt.touches[1].pageX - currentX, y: evt.touches[1].pageY - currentY };

				if (preV.x !== null) {
					if (this.pinchStartLen > 0) {
						evt.zoom = getLen(v) / this.pinchStartLen;
						this.pinch.dispatch(evt, this.element);
					}

					evt.angle = getRotateAngle(v, preV);
					this.rotate.dispatch(evt, this.element);
				}
				preV.x = v.x;
				preV.y = v.y;

				if (this.x2 !== null && this.sx2 !== null) {
					evt.deltaX = (currentX - this.x2 + sCurrentX - this.sx2) / 2;
					evt.deltaY = (currentY - this.y2 + sCurrentY - this.sy2) / 2;
				} else {
					evt.deltaX = 0;
					evt.deltaY = 0;
				}
				this.twoFingerPressMove.dispatch(evt, this.element);

				this.sx2 = sCurrentX;
				this.sy2 = sCurrentY;
			} else {
				if (this.x2 !== null) {
					evt.deltaX = currentX - this.x2;
					evt.deltaY = currentY - this.y2;

				} else {
					evt.deltaX = 0;
					evt.deltaY = 0;
				}


				this.pressMove.dispatch(evt, this.element);
			}

			this.touchMove.dispatch(evt, this.element);

			this._cancelLongTap();
			this.x2 = currentX;
			this.y2 = currentY;

			if (len > 1) {
				evt.preventDefault();
			}
		},
		end: function(evt) {
			if (!evt.changedTouches) return;
			this._cancelLongTap();
			var self = this;
			if (evt.touches.length < 2) {
				this.multipointEnd.dispatch(evt, this.element);
			}

			//swipe
			if ((this.x2 && Math.abs(this.x1 - this.x2) > 30) ||
				(this.y2 && Math.abs(this.y1 - this.y2) > 30)) {
				evt.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2);
				this.swipeTimeout = setTimeout(function() {
					self.swipe.dispatch(evt, this.element);

				}, 0)
			} else {
				this.tapTimeout = setTimeout(function() {
					if (!self._preventTap) {
						self.tap.dispatch(evt, this.element);
					}
					// trigger double tap immediately
					if (self.isDoubleTap) {
						self.doubleTap.dispatch(evt, this.element);
						clearTimeout(self.singleTapTimeout);
						self.isDoubleTap = false;
					}
				}, 0)

				if (!self.isDoubleTap) {
					self.singleTapTimeout = setTimeout(function() {
						self.singleTap.dispatch(evt, this.element);
					}, 250);
				}
			}

			this.touchEnd.dispatch(evt, this.element);

			this.preV.x = 0;
			this.preV.y = 0;
			this.zoom = 1;
			this.pinchStartLen = null;
			this.x1 = this.x2 = this.y1 = this.y2 = null;
		},
		cancelAll: function() {
			this._preventTap = true
			clearTimeout(this.singleTapTimeout);
			clearTimeout(this.tapTimeout);
			clearTimeout(this.longTapTimeout);
			clearTimeout(this.swipeTimeout);
		},
		cancel: function(evt) {
			this.cancelAll()
			this.touchCancel.dispatch(evt, this.element);
		},
		_cancelLongTap: function() {
			clearTimeout(this.longTapTimeout);
		},
		_cancelSingleTap: function() {
			clearTimeout(this.singleTapTimeout);
		},
		_swipeDirection: function(x1, x2, y1, y2) {
			return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
		},

		on: function(evt, handler) {
			if (this[evt]) {
				this[evt].add(handler);
			}
		},

		off: function(evt, handler) {
			if (this[evt]) {
				this[evt].del(handler);
			}
		},

		destroy: function() {
			if (this.singleTapTimeout) clearTimeout(this.singleTapTimeout);
			if (this.tapTimeout) clearTimeout(this.tapTimeout);
			if (this.longTapTimeout) clearTimeout(this.longTapTimeout);
			if (this.swipeTimeout) clearTimeout(this.swipeTimeout);

			this.element.removeEventListener("touchstart", this.start);
			this.element.removeEventListener("touchmove", this.move);
			this.element.removeEventListener("touchend", this.end);
			this.element.removeEventListener("touchcancel", this.cancel);

			this.rotate.del();
			this.touchStart.del();
			this.multipointStart.del();
			this.multipointEnd.del();
			this.pinch.del();
			this.swipe.del();
			this.tap.del();
			this.doubleTap.del();
			this.longTap.del();
			this.singleTap.del();
			this.pressMove.del();
			this.twoFingerPressMove.del()
			this.touchMove.del();
			this.touchEnd.del();
			this.touchCancel.del();

			this.preV = this.pinchStartLen = this.zoom = this.isDoubleTap = this.delta = this.last = this.now = this.tapTimeout = this.singleTapTimeout = this.longTapTimeout = this.swipeTimeout = this.x1 = this.x2 = this.y1 = this.y2 = this.preTapPosition = this.rotate = this.touchStart = this.multipointStart = this.multipointEnd = this.pinch = this.swipe = this.tap = this.doubleTap = this.longTap = this.singleTap = this.pressMove = this.touchMove = this.touchEnd = this.touchCancel = this.twoFingerPressMove = null;

			return null;
		}
	};

	if (typeof module !== 'undefined' && typeof exports === 'object') {
		module.exports = AlloyFinger;
	} else {
		window.AlloyFinger = AlloyFinger;
	}
})();

/**
 * 计算设备宽度和高度
 * @Author   陈龙
 * @DateTime 2017-12-08
 */
(function(win) {
	function F(opt) {
		this.init(opt);
		return {
			play: function(done) {
				this.animationEnd = false;
				this.draw();
				done && typeof done == "function" && done();
			}.bind(this),
			stop: function(done) {
				this.animationEnd = true;
				done && typeof done == "function" && done();
			}.bind(this)
		}
	}
	F.prototype = {
		constructor: F,
		init: function(opt) {
			var deviceInfo = calcDeviceInfo();
			this.device = {
				width: deviceInfo.width,
				height: deviceInfo.height
			}
			this.img = "./ask/fluttered.png";
			this.particles = [];
			var _n = Number(opt && opt.nodes || 0);
			this.nodes = isNaN(_n) ? 0 : _n;

			this.done = opt && typeof opt.done == 'function' ? this.done : null;

			var _z = Number(opt && opt.zIndex || 100);

			this.zIndex = isNaN(_z) ? 100 : _z;

			this.elName = opt && opt.el || null;
			// win.onload = function() {
			this.createCanvas();
			// }
		},
		createCanvas: function() {
			this.box = document.createElement('canvas');
			if (!this.box.getContext) {
				canvasNoSupport();
				console.log('傻逼，你的浏览器不支持canvas!');
				return;
			}
			this.context = this.box.getContext('2d');
			this.box.width = this.device.width;
			this.box.height = this.device.height;
			this.box.className = 'drift-canvas';
			var z = this.zIndex;
			this.box.style.zIndex = z;
			this.box.style.position = "absolute";
			this.box.style.top = "0";
			this.box.style.left = "0";
			this.box.style.right = "0";
			this.box.style.bottom = "0";
			if (this.elName) {
				this.$el = isElementNode(this.elName) ? this.elName : document.querySelector(this.elName);
			} else {
				this.$el = document.getElementsByTagName('body')[0];
			}
			this.$el.appendChild(this.box);
			this.buildImgPath();
			this.downLoadImg();
		},
		buildImgPath() {
			this.imgPaths = [
				{ sx: 2, sy: 0, dWidth: 18, dHeight: 18 },
				{ sx: 22, sy: 0, dWidth: 18, dHeight: 18 },
				{ sx: 44, sy: 0, dWidth: 18, dHeight: 18 },
				{ sx: 66, sy: 0, dWidth: 18, dHeight: 18 },
				{ sx: 86, sy: 0, dWidth: 18, dHeight: 18 },
				{ sx: 104, sy: 0, dWidth: 18, dHeight: 18 },
				{ sx: 0, sy: 38, dWidth: 44, dHeight: 44 },
				{ sx: 44, sy: 38, dWidth: 44, dHeight: 44 },
				{ sx: 90, sy: 38, dWidth: 44, dHeight: 44 },
				{ sx: 154, sy: 38, dWidth: 46, dHeight: 32 },
				{ sx: 200, sy: 38, dWidth: 46, dHeight: 40 },
				{ sx: 248, sy: 38, dWidth: 46, dHeight: 34 },
				{ sx: 0, sy: 102, dWidth: 60, dHeight: 48 },
				{ sx: 78, sy: 102, dWidth: 32, dHeight: 48 },
				{ sx: 126, sy: 102, dWidth: 58, dHeight: 46 },
				{ sx: 10, sy: 174, dWidth: 16, dHeight: 24 },
				{ sx: 40, sy: 174, dWidth: 16, dHeight: 24 },
				{ sx: 72, sy: 174, dWidth: 16, dHeight: 24 },
				{ sx: 101, sy: 174, dWidth: 16, dHeight: 24 },
				{ sx: 124, sy: 174, dWidth: 18, dHeight: 24 },
				{ sx: 150, sy: 174, dWidth: 24, dHeight: 24 },
				{ sx: 186, sy: 174, dWidth: 12, dHeight: 24 },
				{ sx: 214, sy: 174, dWidth: 12, dHeight: 24 },
				{ sx: 242, sy: 174, dWidth: 12, dHeight: 24 },
				{ sx: 272, sy: 174, dWidth: 20, dHeight: 24 },
				{ sx: 6, sy: 210, dWidth: 22, dHeight: 28 },
				{ sx: 44, sy: 210, dWidth: 20, dHeight: 28 },
				{ sx: 74, sy: 210, dWidth: 34, dHeight: 22 },
				{ sx: 126, sy: 210, dWidth: 36, dHeight: 22 },
				{ sx: 172, sy: 210, dWidth: 24, dHeight: 24 },
				{ sx: 214, sy: 210, dWidth: 24, dHeight: 24 },
				{ sx: 244, sy: 210, dWidth: 16, dHeight: 24 },
				{ sx: 276, sy: 210, dWidth: 24, dHeight: 24 },
				{ sx: 326, sy: 210, dWidth: 22, dHeight: 16 }
			]
		},
		downLoadImg() {
			var img = new Image(); // 创建img元素
			img.onload = function() {
				this.imgTag = img; //获得img标签
				this.imgWidth = img.width;
				this.imgHeight = img.height;
				this.renderParticle();
			}.bind(this);
			img.src = this.img; // 设置图片源地址
		},
		renderParticle() {
			for (var i = 0; i < this.nodes; i++) {
				var imgIndex = randomNumber('integer', 0, this.imgPaths.length - 1);
				this.particles[i] = new Particle(this.imgPaths[imgIndex], this.imgTag, this.context, this.device);
			}
			// this.draw();
		},
		draw: function() {
			// 清除画布
			this.context.clearRect(0, 0, this.box.width, this.box.height);
			if (this.requestAnimationID) win.cancelAnimationFrame(this.requestAnimationID);
			if (this.animationEnd) return;
			for (var i = 0, l = this.particles.length; i < l; i++) {
				this.particles[i].draw();
			}
			this.requestAnimationID = win.requestAnimationFrame(this.draw.bind(this));
		},
		canvasAnimationEnd() {
			var _end = this.particles.reduce(function(end, particle) {
				if (particle.end) {
					end++;
				}
				return end;
			}, 0);
			if (_end == this.particles.length) {
				this.animationEnd = true;
				this.done && this.done(this);
				this.box.remove && this.box.remove();
			}
		}
	}
	var Particle = function(imgPath, imgTag, context, device) {
		this.sx = imgPath.sx;
		this.sy = imgPath.sy;
		this.width = imgPath.dWidth;
		this.height = imgPath.dHeight;
		this.img = imgTag;
		this.delay = Number(randomNumber('float', 0, 3).toFixed(2)) * 1000; //该单元执行前的延迟，0-3s不等
		this.scale = randomNumber('integer', 5, 10) / 10; //缩放比例
		this.x = randomNumber('integer', 0, device.width);
		this.maxX = device.width - (this.width * this.scale);
		if (this.x >= this.maxX) {
			this.x = this.maxX - 4;
		}
		this.y = -(this.height * this.scale) - 10;
		this.maxY = device.height;
		this.vx = randomNumber('integer', 5, 1) / 10;
		this.vx = randomNumber('integer', 1, 100) >= 50 ? this.vx : -this.vx;

		this.vy = randomNumber('integer', 5, 15) / 10;
		this.vy = randomNumber('integer', 1, 100) >= 50 ? this.vy : -this.vy;
		this.end = false; //动画是否完成
		this.start = null; // 动画开始时间
		this.rotate = randomNumber('integer', 5, 20); //本单元初始的旋转角度
		this.rotate = randomNumber('integer', 1, 100) >= 50 ? this.rotate : -this.rotate;
		this.vrotate = 0;
		this.draw = function() {
			if (this.start == null || this.end) {
				this.end = false;
				this.y = -(this.height * this.scale) - 10;
				this.start = Date.now();
			}
			this.vrotate = this.vrotate + 0.0299;
			var curRotate = Math.sin(this.vrotate);
			var angle = this.rotate * Math.PI / 180;
			var _time = Date.now() - this.start - this.delay;
			if (_time >= 0) {
				this.y += this.vy;
			}
			this.x += this.vx;
			if (this.x >= this.maxX || this.x <= 0) {
				this.vx *= -1;
			}
			context.save();
			context.translate(this.x + (this.width * this.scale) / 2, this.y + (this.height * this.scale) / 2);
			context.scale(this.scale, this.scale);
			context.rotate(angle * curRotate);
			context.drawImage(this.img, this.sx, this.sy,
				this.width, this.height, -this.width / 2, -this.height / 2,
				this.width, this.height
			);
			context.restore();

			if (this.y >= this.maxY) {
				this.end = true;
			}
		}
	};
	function calcDeviceInfo() {
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
	}

	function isElementNode(node) {
		return node !== void 0 && node.nodeType === 1;
	}

	function randomNumber(type, min, max) {
		if (type == 'integer') {
			min = parseInt(min, 10);
			max = parseInt(max, 10);
			return min + parseInt(Math.random() * (max - min + 1), 10);
		}
		if (type == 'float') {
			return min + Math.random() * (max - min + 1);
		}
		return null;
	};
	function easeInOutQuad(t, b, c, d) {
		if ((t /= d / 2) < 1) return c / 2 * t * t + b;
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	}

	function Linear(t, b, c, d) {
		return c * t / d + b;
	}
	win.Fluttered = function(opt) {
		return new F(opt);
	}
})(window)
