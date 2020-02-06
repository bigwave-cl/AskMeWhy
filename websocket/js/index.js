var OWebSocket = {
	init:function(){
		if(!window.WebSocket){
			layer.msg('浏览器不支持websocket,别装B!');
		    return;
		}

		this.ws = new WebSocket('ws://localhost:8181');
		this.handle();
		this.bindEvent();
	},
	handle:function(){
		var _self = this;
		_self.ws.onopen = function(){
            handleMessage({message:"服务器已连接"});
		};
		_self.ws.onmessage = function (e) {
            var data = JSON.parse(e.data);
            handleMessage(data);
        }
        _self.ws.onclose = function (e) {
            handleMessage({message:"服务器关闭"});
        }
	    _self.ws.onerror = function (e) {
	        // console.log('error');
            handleMessage({message:"服务器出错"});
	    }
	},
	bindEvent:function(){
		var _self = this;
		$('body').on('click','#send',function(e){
			_self.sendMessage(e);
		});
		$('body').on('click','#change_btn',function(e){
			_self.changeName(e);
		});
	},
	sendMessage:function(e){
		var _val = $('#form_message').val();
		
		if(this.ws.readyState !== WebSocket.OPEN){
			layer.msg('现在不能进行此操作');
			return;
		}
		if(!_val) {
			layer.msg('消息不能为空');
			return;
		}
		this.ws.send(_val);
		$('#form_message').val('');
	},
	changeName:function(e){

		var _val = $('#form_nick_name').val();
		if(this.ws.readyState !== WebSocket.OPEN){
			layer.msg('现在不能进行此操作');
			return;
		}
		if(!_val) {
			layer.msg('昵称不能为空');
			return;
		}

		this.ws.send('/n_i^c.k/ '+_val);
		$('#form_nick_name').val('');
	}
}
OWebSocket.init();

function handleMessage(opt){
	var option = {
		type: '',
		message : undefined,
		state: '',
		time: '',
		nickname: ''
	}

	if (opt && typeof opt === "object") {
	    option = $.extend(true, option, opt);
	}

	if (typeof option.message == "undefined") return;
	var box = document.getElementById('chat_list'),
		boxLi = document.createElement('li'),
		html = '';

	if(option.type === 'dialogue'){
		if(option.state === 1){
			html = '<div class="message me">\
					    <span class="time">'+option.time+'</span>\
					    <span class="name"><i>'+option.nickname+'</i></span>\
					    <span class="detail"><i>'+option.message+'</i></span>\
					</div>';
		}
		if(option.state === 2){
			html = '<div class="message">\
					    <span class="time">'+option.time+'</span>\
					    <span class="name"><i>'+option.nickname+'</i></span>\
					    <span class="detail"><i>'+option.message+'</i></span>\
					</div>';
		}
	}else if( option.type === 'system'){
		html = '<div class="message-box">\
                    <span class="default">'+option.message+'</span>\
                </div>';
        if(option.state === 3){
			setNickName(option.nickname);
        }
	}else{
		html = '<div class="message-box">\
                    <span class="default">'+option.message+'</span>\
                </div>';
	}
	boxLi.innerHTML = html;
	box.appendChild(boxLi);
	$(box).animate({scrollTop: box.scrollHeight},'.3s',
		function(e){
	        // $('body').trigger('scrollDone');
	});
}

function setNickName(name){
	var _nick = document.getElementById('nick_name');
	_nick.innerHTML = name;
}