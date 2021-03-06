const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname,'../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
const notifier = require('node-notifier');

app.use(express.static(publicPath));

io.on('connection', (socket) =>{
	
	socket.on('getRoomList', (callback) =>{
		callback(users.getRoomList());
	});

	socket.on('join', (params, callback) =>{
		if(!isRealString(params.name) || !isRealString(params.room)){
			return callback('Name and room name are require!')
		}

		socket.join(params.room);
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);

		io.to(params.room).emit('updateUserList', users.getUserList(params.room));
		socket.emit('newMessage', generateMessage('Admin',`Hello ${params.name}, Welcome to the chat app`,false));
		socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`,false));
		callback();
	});

	socket.on('createMessage', (message , callback) =>{
		var user = users.getUser(socket.id);
		if(user && isRealString(message.text)){
			//socket.emit('newMessage', generateMessage(message.from, message.text,false));
			
			socket.broadcast.to(user.room).emit('newMessage', generateMessage(message.from, message.text,true));
			// io.to(user.room).emit('newMessage', generateMessage(message.from, message.text,message.notification));
		}

		callback();
	});

	socket.on('createMessageSelf', (message , callback) =>{
		var user = users.getUser(socket.id);
		if(user && isRealString(message.text)){
			notifier.notify({
  				title: message.from,
  				message: message.text
			});
			socket.emit('newMessage', generateMessage(message.from, message.text,false));
			//socket.broadcast.to(user.room).emit('newMessage', generateMessage(message.from, message.text,true));
			// io.to(user.room).emit('newMessage', generateMessage(message.from, message.text,message.notification));
		}

		callback();
	});

	socket.on('createLocationMessage', (coords) =>{
		var user = users.getUser(socket.id);
		if(user){
			io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
		}
		 
	});

	socket.on('disconnect', () =>{
		var user = users.removeUser(socket.id);

		if(user){
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`, false));
		}
	});
});

server.listen(port, () =>{ 
	console.log(`Server is up on port ${port}`);
});
