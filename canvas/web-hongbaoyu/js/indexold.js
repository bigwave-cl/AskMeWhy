
;(function($win){
    //天降红包
    function Drif(opt) {
        this.init(opt);
    }

    Drif.prototype = {
        constructor: Drif,
        init: function(opt) {

            this.cwidth = this._getPageArea().width;
            this.cheight = this._getPageArea().height;
            this.particles = [];
            this.nodes = opt.nodes;
            this.setting = {
                img: opt.src,
                callback:opt.callback
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
            var z = parseInt(Date.now()*0.001,10);
            
            this.box.style.zIndex = z;
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
                _self.imgO = img;
                _self.render();
            }
            img.src = _self.setting.img // 设置图片源地址
        },
        render:function(){
            var _self = this;
            for (var i = 0, l = _self.nodes.length; i < l ; i++) {
                var particle = {
                    img : _self.imgO,   //图片源
                    delay: 0,           //动画启动的延迟
                    width: 70,          //图片宽度
                    height: 75,         //图片高度
                    vx: randomF(.5,1),      //图片在X方向运动的速率
                    vy : randomF(1,3),       //图片在Y方向运动的速率
                    startX : randomZ(0,_self.cwidth),       //图片在x轴方向开始的位置
                    startY : -100,                          //图片在y轴方向开始的位置
                    rotate : randomS(45,50),        //图片初始的旋转角度
                    text : _self.nodes[i].text,
                    name : _self.nodes[i].name,
                    deltaTime : 0,
                    roateMaxW:randomZ(500,_self.cwidth)
                }
                _self.particles.push(particle);
            }
            function draw(){
                _self.step();
                if(_self.requestId1) window.cancelAnimationFrame(_self.requestId1);
                
                _self.requestId2 = window.requestAnimationFrame(draw);

                if(_self.animateEnd){
                    if(_self.requestId2) window.cancelAnimationFrame(_self.requestId2);

                    _self.setting.callback();
                }
            }
            _self.minVy =Math.abs(_self._minNum(_self.particles,'vy'));
            _self.animateEnd = false;
            _self.startTime = Date.now();
            _self.requestId1 = window.requestAnimationFrame(draw);
        },
        step:function(){
            var _self = this;
            _self.context.clearRect(0,0, _self.cwidth, _self.cheight);

            for (var i = 0,l = _self.particles.length; i < l; i++) {
                var cur_p = _self.particles[i];
                var nowTime = Date.now(),
                    differenceTime = Math.floor(nowTime - _self.startTime);
                if(differenceTime >= cur_p.delay){
                    cur_p.startX += cur_p.vx;
                    cur_p.startY += cur_p.vy;
                    function clamp(min, max, value) {
                        if (value > max) {
                            return max;
                        } else if (value < min) {
                            return min;
                        } else {
                            return value;
                        }
                    }
                    var minW = 0;
                    if (cur_p.startX <= minW || cur_p.startX >= cur_p.roateMaxW) {
                        cur_p.vx *= -1;
                        cur_p.startX = clamp(minW, cur_p.roateMaxW, cur_p.startX)
                    }
                    if(Math.abs(cur_p.vy) <= _self.minVy && cur_p.startY >= _self.cheight + 20){
                        _self.animateEnd = true;
                        $(_self.box).remove();
                        return;
                    }
                    var rateRote = Date.now()*0.0008;
                    var cur_rate = Math.sin(rateRote);

                    var angle = cur_p.rotate * Math.PI / 180;
                    var cur_rx = cur_p.startX,
                        cur_ry = cur_p.startY,
                        cur_px = cur_p.startX,
                        cur_py = cur_p.startY - cur_p.height / 2 + 50;
                    var radius = cur_ry - cur_py;
                    var cur_dx = cur_rx + radius * Math.sin(angle*cur_rate),
                        cur_dy = cur_ry - radius * Math.cos(angle*cur_rate);

                    _self.context.save();
                    _self.context.translate(cur_dx, cur_dy);
                    _self.context.scale(.5,.5);
                    _self.context.rotate(angle*cur_rate);
                    _self.context.translate(-cur_dx, -cur_dy);
                    _self.context.drawImage(cur_p.img, cur_dx - 15 - cur_p.width / 2, cur_dy - cur_p.height / 2);
                    _self.context.restore();

                    _self.context.font = "18px 'dqht','Microsoft YaHei',Monospace,Arial,'Helvetica Neue',Helvetica,sans-serif";
                    var textName = _self.context.measureText(cur_p.name),
                        textAll = _self.context.measureText(cur_p.name+cur_p.text);
                    var cur_textLeft = cur_p.startX - textAll.width/2,
                        cur_textTop = cur_p.startY+cur_p.height+0;
                    _self.context.fillStyle = "#ff4545"; 
                    _self.context.fillText(cur_p.name, cur_textLeft, cur_textTop);
                    _self.context.fillStyle = "#fff887";
                    _self.context.fillText(cur_p.text, cur_textLeft + textName.width+10, cur_textTop);
                }
                
            }
        },
        _minNum:function(arr,attr){
            var tempArr=[];
            for(var i=0;i<arr.length;i++){
                tempArr.push(Math.abs(arr[i][attr]));
            }
            return tempArr.sort(function(a,b){return a-b})[0];
        },
    }

    function randomZ(min,max){
        return min + Math.floor(Math.random() * (max - min));
    }

    function randomS(min,max){
        return randomZ(1,100) >= 50 ? randomZ(min,max) : - randomZ(min,max);
    }

    function randomF(min,max){
        var f = min + Math.random() * (max - min);
        return f;
    }


    function fnNoSupport() {
        var sup = document.createElement('div');
        sup.setAttribute('class', 'no-support');
        sup.innerHTML = '你的浏览器不支持canvas!';
        document.getElementsByTagName('body')[0].appendChild(sup);
    }

    ;(function() {
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
    $win.driftDown = function(opt) {
        return new Drif(opt);
    }
})(window);

function nodeInit(val){
	var n = [];
	for (var i = 0,l = val; i < l; i++) {
		n.push({
			id : i,
			name : '项羽'+ (i+1),
			text: '抢到了'+Math.floor(Math.random() * 990 + 10)+'云积分'
		})
	}
	return n;
}

var setI = null;
function randomDrif(){
    var timer = Math.floor(Math.random() * 20) + 6;
    var num = Math.floor(Math.random() * 45) + 5;
    var n = nodeInit(num);
    driftDown({
        nodes: n,
        src:'./test.png',
        callback:function(){
            clearTimeout(setI);
            setI = setTimeout(randomDrif,timer);
        }
    });
}


window.onload = function() {
   randomDrif();
}
