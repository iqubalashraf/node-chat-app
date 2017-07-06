var socket = io();


socket.on('connect', function () {
		socket.emit('getRoomList', function(roomList){
			if(roomList){
				console.log(`Room List: ${roomList}`);
			}else{
				console.log(`No Room`);
			}
		});
	});
