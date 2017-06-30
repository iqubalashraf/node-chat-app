var socket = io();

	socket.on('connect', function () {
		console.log('Connected to server');
		socket.emit('createMessage',{
			from: 'ashraf@gmail.com',
			text: 'Hey, Whats up.'
		}); 
	});

	socket.on('disconnect', function () {
		console.log('Disconnected from server');
	});

	socket.on('newMessage', function(message){
		console.log('newMessage',message);
	});