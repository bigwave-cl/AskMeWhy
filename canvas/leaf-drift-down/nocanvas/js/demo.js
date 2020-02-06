function Drif(opt) {
    this.init(opt);
}

Drif.prototype = {
    constructor: Drif,
    init: function(opt) {

        this.cwidth = this._getPageArea().width;
        this.cheight = this._getPageArea().height;
        this.particles = [];
        this.paths = [];
        this.nodes = opt.nodes;
        this.initData();
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
    createBoxss: function() {
        this.box = document.createElement('canvas');
        if (!this.box.getContext) {
            fnNoSupport();
            console.log('傻逼，你的浏览器不支持canvas!');
            return;
        }
        this.context = this.box.getContext('2d');
        this.box.width = this.cwidth;
        this.box.height = this.cheight;
        this.box.style.zIndex = Date.now();
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
        img.src = './test.png'; // 设置图片源地址
    },
    render:function(){
    },
    initData:function(){
        var _self = this;

        for (var i = 0, l = _self.nodes.length; i < l ; i++) {
            var particle = {
                img : './test.png',   //图片源
                delay: randomZ(0,1000),    //动画启动的延迟
                width: 50,          //图片宽度
                height: 55,         //图片高度
                duration: randomZ(1000,2000),      //动画执行时间
                startX : randomZ(0,_self.cwidth),      //图片在x轴方向开始的位置
                startY : -100,                                          //图片在y轴方向开始的位置
                rotate : randomZ(0,9) >= 5 ? randomZ(0,90) : -randomZ(0,90),      //图片初始的旋转角度
                text : _self.nodes[i].text,
                name : _self.nodes[i].name
            },
            keyframes = {
                x1 : randomS(0,_self.cwidth/10),
                x2 : randomS(0,_self.cwidth/20),
                x3 : randomS(0,_self.cwidth),
                x4 : randomS(0,_self.cwidth/20),
                x5 : randomS(0,_self.cwidth/10)
            };
            _self.particles.push(particle);
            _self.paths.push(keyframes);
        }
        _self.createItem();
        // _self.createAnimation();
    },
    createAnimation:function(){
        var _self = this;
        var cssAnimation = document.createElement('style');
        var no = Date.now();
        cssAnimation.type = "text/css";
        cssAnimation.id = no;
        var rules = [];
        for (var i = 0, l = _self.paths.length; i < l ; i++) {
            var _once = _self.paths[i];
            var _rule = '<style type="text/css" id='+no+'>\
                            @-webkit-keyframes drif-frame-' + no + '{\
                                0%{\
                                    '+getCompatible('transform')+': translate('+_once.x1+'px,0px)\
                                }\
                                25%{\
                                    '+getCompatible('transform')+': translate('+_once.x2+'px,0px)\
                                }\
                                50%{\
                                    '+getCompatible('transform')+': translate('+_once.x3+'px,0px)\
                                }\
                                75%{\
                                    '+getCompatible('transform')+': translate('+_once.x4+'px,0px)\
                                }\
                                100%{\
                                    '+getCompatible('transform')+': translate('+_once.x5+'px,0px)\
                                }\
                            }\
                            @keyframes drif-frame-' + no + '{\
                                0%{\
                                    '+getCompatible('transform')+': translate('+_once.x1+'px,0px)\
                                }\
                                25%{\
                                    '+getCompatible('transform')+': translate('+_once.x2+'px,0px)\
                                }\
                                50%{\
                                    '+getCompatible('transform')+': translate('+_once.x3+'px,0px)\
                                }\
                                75%{\
                                    '+getCompatible('transform')+': translate('+_once.x4+'px,0px)\
                                }\
                                100%{\
                                    '+getCompatible('transform')+': translate('+_once.x5+'px,0px)\
                                }\
                            }\
                        </style>';
            rules.push(_rule);
        }
        $(cssAnimation).html(rules.join(''));
        $(document.getElementsByTagName('head')[0]).append($(cssAnimation).prop('outerHTML'));
    },
    createItem:function(){
        var htmls = [];
        function draw(){
            for (var i = 0, l = 1; i < l ; i++) {
                var _html = '<div class="drif-once-ver">\
                                <div class="drif-once-hor">\
                                    <div class="box">\
                                        <img src="./test.png" alt="" width="50" height="55">\
                                        <div class="text"><span>项羽</span>抢到了125云积分</div>\
                                    </div>\
                                </div>\
                            </div>';
                $('.drif-animation-box').html(_html)

            }
            // window.requestAnimationFrame(draw);
        }
        window.requestAnimationFrame(draw);
    }
}


function randomZ(min,max){
    return min + Math.floor(Math.random() * (max - min));
}
function randomS(min,max){
    return randomZ(1,100) >= 50 ? randomZ(min,max) : - randomZ(min,max);
}
function getCompatible(tag) {
    var compatible = '',
        divStyle = document.createElement('div').style,
        compatibleArr = [tag, '-webkit-'+tag, '-moz-'+tag, '-ms-'+tag, '-o-'+tag];
    //这里的驼峰命名方式被我取消，而采用通用css属性名，fixbug
    for (var i = 0, len = compatibleArr.length; i < len; i++) {
        if (compatibleArr[i] in divStyle) {
            return compatible = compatibleArr[i];
        }
    }
    return compatible;
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

function nodeInit(val){
    var n = [];
    for (var i = 0,l = val; i < l; i++) {
        n.push({
            id : i,
            name : '项羽'+ (i+1),
            text: '抢到了'+Math.floor(Math.random() * 990 -10)+'云积分'
        })
    }
    return n;
}

function driftDown(opt) {
    return new Drif(opt);
}
window.onload = function() {
    driftDown({
        nodes: nodeInit(10)
    });
}
