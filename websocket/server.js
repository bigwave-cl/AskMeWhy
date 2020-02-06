var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server,
	wss = new WebSocketServer({ port: 8181 }),
	uuid = require('node-uuid');

var clients = [],
	clientIndex = 0;
wss.on('connection', function(ws) {
	var client_uuid = uuid.v4();
	clientIndex ++ ;
	var nickname = "AskMeWhy--" + clientIndex;
    clients.push({ "id": client_uuid, "ws": ws, "nickname": nickname });
	wsSend('system', client_uuid , nickname, '欢迎"\''+ nickname + '\'上线',getDate(),1);

	ws.on('message', function(message) {
		if(message.indexOf('/n_i^c.k/') === 0){
			var nickname_array = message.split(' ');
			if(nickname_array.length >=2){
				var oldName = nickname;
				nickname = nickname_array[1];
                var nickname_message = "\'"+ oldName + "\' 更改昵称为： \'" + nickname + "\'";
                wsSend("system", client_uuid, nickname, nickname_message , getDate(),1);
			}
		}else{
			wsSend('dialogue', client_uuid , nickname, message ,getDate());
		}

	});
	ws.on('close', function () {
	    closeSocket(client_uuid , nickname);
	});

    process.on('SIGINT', function () {
        closeSocket(client_uuid , nickname , '服务器断开连接');
        process.exit();
    });

});

function wsSend(type, client_uuid, nickname, message ,time, online){

	for (var i = 0 , l = clients.length; i < l; i++) {
		var clientSocket = clients[i].ws;
		if(clientSocket.readyState === WebSocket.OPEN){
			if(clients[i].id == client_uuid){
				if(online == 1){
					clientSocket.send(JSON.stringify({
						type: type,
						id : client_uuid,
						message: message,
						state: 3,
						time : time,
						nickname: nickname
					}));
				}else{
					clientSocket.send(JSON.stringify({
						type: type,
						id : client_uuid,
						message: message,
						state: 1,
						time : time,
						nickname: nickname
					}));
				}
			}else{
				clientSocket.send(JSON.stringify({
					type: type,
					id : client_uuid,
					message: message,
					state: 2,
					time : time,
					nickname: nickname
				}));
			}
		}
	}
}

function getDate(){
	var now = new Date();
	return now.getFullYear() + '-' + 
		   handleDate( now.getMonth() + 1 , 10) + '-' +
		   handleDate( now.getDate() + 1 , 10) + '  ' +
		   handleDate( now.getHours() , 10) + ':' +
		   handleDate( now.getMinutes() , 10) + ':' +
		   handleDate( now.getSeconds() , 10);
}
function handleDate(val,max){
	return val < max ?  '0'+ val : val;
}

function closeSocket(client_uuid, nickname, message ){
	for (var i = 0; i < clients.length; i++) {
	    if (clients[i].id == client_uuid) {
	        var disconnect_message;
	        if (message) {
	            disconnect_message = message;
	        } else {
	            disconnect_message = "\'"+ nickname + "\' 已下线";
	        }
	        wsSend("system", client_uuid, nickname, disconnect_message);
	        clients.splice(i, 1);
	    }
	}
}