/*
* @Author: askMeWhy
* @Date:   2017-10-19 18:24:08
* @Last Modified by:   smile
* @Last Modified time: 2018-01-09 15:44:42
*/

var askMask = {
    type: 'slide',
    show:function(content,type){
        this.hide();
        this.type = type || 'slide';
        this.delay = 302;
        if(this.type == 'register') this.delay = 602;
        var html = '\
                <div class="ask-modal '+this.type+'">\
                    <div class="ask-overlay"></div>\
                    <div class="ask-modal-box">\
                        <div class="close-icon"></div>\
                        <div class="modal-content">\
                            '+(content||'默认内容')+'\
                        </div>\
                    </div>\
                </div>\
            ';

        this.bodyStyle = {
        	overflow: document.body.style.overflow,
        	width: document.body.style.width,
        	height: document.body.style.height,
        	position: document.body.style.position
        };
        document.body.style.overflow = 'hidden';

        $('body').append(html);
        $('body').on('click', '.ask-modal .close-icon', function() {
            this.hide();
        }.bind(this))
    },
    hide:function(){
        var boxEl = $('.ask-modal');
        if(boxEl.length){
            boxEl.find('.ask-modal-box').addClass('leave');
            setTimeout(function(){
				document.body.style.position = this.bodyStyle.position;
				document.body.style.width = this.bodyStyle.width;
				document.body.style.height = this.bodyStyle.height;
				document.body.style.overflow = this.bodyStyle.overflow;
                boxEl.remove();
            }.bind(this),this.delay);
        }
    }
}

var TOAST_TRANSITION_DURATION = 500;
var askToast = {
	container:false,
	instances:[],
	spread(msg){
		this.init({
			msg:msg,
			time: 1500,
			class:'spread',
			position:'spread',
		});
	},
	info(msg,time,position){
		this.init({
			msg:msg,
			class:'',
			time: time,
			position: position || 'top-center',
		});
	},
	init(option){
		var opt = {
			msg:'toast',
			class:'',
			time: 3000,
			position:'top-center',
		};
		opt = $.extend(true,opt,option);
		opt.time = parseInt(opt.time,10);
		var instance = this.creatToast(opt);

		if(!instance) return;
		if(this.instances.length === 0){
			this.creatBox(opt.position);
		}
		var onlyKey = Date.now();
		this.instances.push(onlyKey);

		if(isNaN(opt.time)) {
			console.error('time必须是整数');
			return;
		}
		this.changePosition(opt.position);
		this.appendToast(instance,opt,onlyKey);
	},
	creatBox(position){
		this.container = document.createElement('div');
		this.container.classList.add('ask-toast-box');
		this.container.classList.add(position);
		document.body.appendChild(this.container);
	},
	creatToast(opt){
		var instance = document.createElement('div');

		instance.classList.add('ask-toast-message','ask-toast-theme-'+(opt.class =='' ? 'default':opt.class));
		var _msg = opt.msg == '' ? 'toast':opt.msg;
		instance.innerHTML = _msg;
		return instance;
	},
	changePosition(position){
		var _el = this.container;
		if(_el.classList.item(1) != position){
			_el.classList.remove(_el.classList.item(1));
			_el.classList.add(position);
		}
	},
	appendToast(instance,opt,onlyKey){
		instance.style.transitionDuration = TOAST_TRANSITION_DURATION+'ms';
		instance.style.transform = 'translateY(30px)';
		instance.style.opacity = '0';
		this.container.appendChild(instance);
		window.getComputedStyle(instance).getPropertyValue('opacity');
		instance.style.transform = 'translateY(0px)';
		instance.style.opacity = '1';

		var timer = setTimeout(()=>{
			this.removeToast(instance,onlyKey);
			clearTimeout(timer);
		},TOAST_TRANSITION_DURATION+opt.time);
	},
	removeToast(instance,onlyKey){
		var index = this.instances.indexOf(onlyKey);

		if (index === -1) return;

		instance.style.transitionDuration = TOAST_TRANSITION_DURATION+'ms';
		instance.style.transform = 'translateY(-30px)';
		instance.style.opacity = '0';

		var timer = setTimeout(()=>{
			this.instances = this.instances.filter(index=>{
				return index != onlyKey;
			});
			if (this.instances.length === 0) {
				this.container.remove();
			}
			instance.remove();
			clearTimeout(timer);
		},TOAST_TRANSITION_DURATION);
	}
};
var templateEngine = (function(){
	var pattern = /\{\{(\w*[:]*[=]*\w+)\}\}(?!})/g;
	return function(template,json){
		return template.replace(pattern,function(match,key,value){
			return json[key];
		});
	}
})();

var askAdaption = function(opt){
	var Ask = function(opt){
		this.init(opt);
	}
	Ask.prototype = {
		constructor: Ask,
		init:function(opt){
			var multiple = {
			        w: 0,
			        h: 0
			    };
			var sw = 1920,
			    sh = 1080,
			    sp = this.getPrint();
			multiple.w = sp.width / sw;
			multiple.h = sp.height / sh;
			var container = document.querySelector('.adap-container');
			var classList = container.classList,
				style = container.style;
			if(multiple.w < 1 || multiple.h < 1 || (multiple.w == 1 && multiple.h == 1)){
				style.width = "";
				style.height = "";
				if(classList.contains('to-adap')) classList.remove('to-adap');
			}else{
				if(!classList.contains('to-adap')) classList.add('to-adap');
				if(multiple.w > multiple.h){
					style.width = sw * multiple.h + "px";
					style.height = sp.height + "px";
				}
				if(multiple.w < multiple.h){
					style.width = sp.width + "px";
					style.height = sh * multiple.w + "px";
				}
			}
			window.onresize = this.init.bind(this);
		},
		getPrint: function() {
		    var user = navigator.userAgent;
		    if (document.compatMode == "BackCompat") {
		        return {
		            width: Math.max(document.body.scrollWidth, document.body.clientWidth),
		            height: Math.max(document.body.scrollHeight, document.body.clientHeight)
		        }
		    } else {
		        if (user.indexOf('WOW64') > -1 || user.indexOf('MSIE') > -1) {
		            return {
		                width: document.documentElement.clientWidth,
		                height: document.documentElement.clientHeight
		            }
		        } else {
		            return {
		                width: Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth),
		                height: Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight)
		            }
		        }
		    }
		}
	}

	return new Ask(opt);
}
