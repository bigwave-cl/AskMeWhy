;
(function(_) {
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    var grain = function(opt) {
        this.init(opt);
    }
    grain.prototype = {
        constructor: grain,
        init: function(opt) {
            this.cwidth = this._getPageArea().width;
            this.cheight = this._getPageArea().height;
            this.nodes = [];
            this.edges = [];

            this.mousePos = [0, 0];
            this.setting = {
                easingFactor: 5.0,
                backgroundColor: '#000',
                nodeColor: '#fff',
                edgeColor: '#fff'
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
            this.box.style.zIndex = Date.now();
            this.box.style.position = "fixed";
            this.box.style.top = "0";
            this.box.style.left = "0";

            var oBody = document.getElementsByTagName('body')[0];
            oBody.appendChild(this.box);
            this.initCanvas();
        },
        initCanvas:function(){
            var _self = this;
            window.onmousemove = function(e) {
                _self.mousePos[0] = e.clientX;
                _self.mousePos[1] = e.clientY;
            }
            
            var res = _.debounce(calculateLayout, 100);
            function calculateLayout() {
                if(_self.animatetime1) window.cancelAnimationFrame(_self.animatetime1);
                if(_self.animatetime2) window.cancelAnimationFrame(_self.animatetime2);
                _self.cwidth = _self._getPageArea().width;
                _self.cheight = _self._getPageArea().height;

                _self.box.width = _self.cwidth;
                _self.box.height = _self.cheight;

                if (_self.nodes.length == 0) {
                    _self.constructNodes();
                }
                _self.render();
                _self.step();
            };
            window.onresize = res;
            window.onresize();
        },
        constructNodes: function() {
            var _self = this;
            for (var i = 0; i < 100; i++) {
                var node = {
                    drivenByMouse: i == 0,
                    x: Math.random() * _self.cwidth,
                    y: Math.random() * _self.cheight,
                    vx: Math.random() * 1 - 0.5,
                    vy: Math.random() * 1 - 0.5,
                    radius: Math.random() > 0.9 ? 3 + Math.random() * 3 : 1 + Math.random() * 3
                };

                _self.nodes.push(node);
            }
            _self.nodes.forEach(function(e) {
                _self.nodes.forEach(function(e2) {
                    if (e == e2) {
                        return;
                    }

                    var edge = {
                        from: e,
                        to: e2
                    }

                    _self.addEdge(edge);
                });
            });
        },
        addEdge: function(edge) {
            var ignore = false,
                _self = this;
            _self.edges.forEach(function(e) {
                if (e.from == edge.from & e.to == edge.to) {
                    ignore = true;
                }

                if (e.to == edge.from & e.from == edge.to) {
                    ignore = true;
                }
            });

            if (!ignore) {
                _self.edges.push(edge);
            }
        },
        step: function() {
            var _self = this;

            function draw() {
                _self.nodes.forEach(function(e) {
                    if (e.drivenByMouse) {
                        return;
                    }

                    e.x += e.vx;
                    e.y += e.vy;

                    function clamp(min, max, value) {
                        if (value > max) {
                            return max;
                        } else if (value < min) {
                            return min;
                        } else {
                            return value;
                        }
                    }

                    if (e.x <= 0 || e.x >= _self.cwidth) {
                        e.vx *= -1;
                        e.x = clamp(0, _self.cwidth, e.x)
                    }

                    if (e.y <= 0 || e.y >= _self.cheight) {
                        e.vy *= -1;
                        e.y = clamp(0, _self.cheight, e.y)
                    }
                });

                _self.adjustNodeDrivenByMouse();
                _self.render();
                _self.animatetime2 = window.requestAnimationFrame(draw);
            }
            _self.animatetime1 = window.requestAnimationFrame(draw);
        },
        adjustNodeDrivenByMouse: function() {
            var _self = this;
            _self.nodes[0].x += (_self.mousePos[0] - _self.nodes[0].x) / _self.setting.easingFactor;
            _self.nodes[0].y += (_self.mousePos[1] - _self.nodes[0].y) / _self.setting.easingFactor;
        },
        render: function() {
            var _self = this;
            _self.context.fillStyle = _self.setting.backgroundColor;
            _self.context.fillRect(0, 0, _self.cwidth, _self.cheight);
            
            // _self.context.clearRect(0,0,_self.cwidth, _self.cheight);

            _self.edges.forEach(function(e) {
                var l = lengthOfEdge(e);

                var threshold = _self.cwidth / 8;

                if (l > threshold) {
                    return;
                }

                _self.context.strokeStyle = _self.setting.edgeColor;
                _self.context.lineWidth = (1.0 - l / threshold) * 2.5;
                _self.context.globalAlpha = 1.0 - l / threshold;
                _self.context.beginPath();
                _self.context.moveTo(e.from.x, e.from.y);
                _self.context.lineTo(e.to.x, e.to.y);
                _self.context.stroke();
            });
            _self.context.globalAlpha = 1.0;

            _self.nodes.forEach(function(e) {
                if (e.drivenByMouse) {
                    _self.context.fillStyle = 'red';
                    _self.context.beginPath();
                    _self.context.arc(e.x, e.y, 5, 0, 2 * Math.PI);
                    _self.context.fill();

                    return;
                }

                _self.context.fillStyle = _self.setting.nodeColor;
                _self.context.beginPath();
                _self.context.arc(e.x, e.y, e.radius, 0, 2 * Math.PI);
                _self.context.fill();
            });
        }
    }

    function fnNoSupport() {
        var sup = document.createElement('div');
        sup.setAttribute('class', 'no-support');
        sup.innerHTML = '傻逼，你的浏览器不支持canvas!';
        document.getElementsByTagName('body')[0].appendChild(sup);
    }

    function lengthOfEdge(edge) {
        //勾股定理 a = b*b + c*c 开根
        return Math.sqrt(Math.pow((edge.from.x - edge.to.x), 2) + Math.pow((edge.from.y - edge.to.y), 2));
    }

    new grain();
})(window._);
