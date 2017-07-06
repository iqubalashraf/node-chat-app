var socket = io();
var user;
	function scrollToBottom(){
		var messages = jQuery('#messages');
		var newMessage = messages.children('li:last-child')

		var clientHeight = messages.prop('clientHeight');
		var scrollTop = messages.prop('scrollTop');
		var scrollHeight = messages.prop('scrollHeight');
		var newMessageHeight = newMessage.innerHeight();
		var lastMessageHeight = newMessage.prev().innerHeight();

		if(clientHeight + scrollTop +newMessageHeight + lastMessageHeight>= scrollHeight){
			messages.scrollTop(scrollHeight);
		}
	}

	function requestNotificationPermission(){
		if (Notification.permission !== "granted")
    		Notification.requestPermission();
	}

	function generateNotification(from,message){
		var notification = new Notification(from, {
      			icon: 'https://cdn0.iconfinder.com/data/icons/Android-R2-png/512/Messages-Android-R.png',
      			body: message
    		});

    		notification.onclick = function () {
      		// window.open("http://stackoverflow.com/a/13328397/1269037");      
    		};
	}

	socket.on('connect', function () {
		var params = jQuery.deparam(window.location.search);
		user = params;
		if (!Notification) {
   				 alert('Desktop notifications not available in your browser. Try Chromium.'); 
    			return;
  			}
		requestNotificationPermission();
		socket.emit('join', params, function(err){
			if(err){
				alert(err);
				window.location.href = '/';
			}else{

			}
		});
	});

	socket.on('disconnect', function () {
		console.log('Disconnected from server');
	});

	socket.on('updateUserList', function(users){
		var ol = jQuery('<ol></ol>');

		users.forEach(function (user){
			ol.append(jQuery('<li></li>').text(user));
		});

		jQuery('#users').html(ol);
	});

	socket.on('newMessage', function(message){
		var formattedTime = moment(message.createdAt).format('h:mm a');
		var template = jQuery('#message-template').html();
		var html = Mustache.render(template,{
			text: message.text,
			from: message.from,
			createdAt: formattedTime
		});
		if (Notification.permission !== "granted")
   			 requestNotificationPermission();
  		else {
  			var notification = true;
  			if (!document.hidden) {
				notification = false;
			}
  			if (message.notification && notification) {
  				generateNotification(message.from,message.text);
  			}
  		}
		jQuery('#messages').append(html);
		scrollToBottom();
	});

	socket.on('newLocationMessage', function(message){
		var formattedTime = moment(message.createdAt).format('h:mm a');
		var template = jQuery('#location-message-template').html();
		var html = Mustache.render(template,{
			url: message.url,
			from: message.from,
			createdAt: formattedTime
		});

		jQuery('#messages').append(html);
		scrollToBottom();
	});

	jQuery('#message-form').on('submit', function(e){
		e.preventDefault();
		var messageTextbox = jQuery('[name=message]');
		socket.emit('createMessage',{
			from: user.name,
			text: messageTextbox.val()
		}, function(data){
			messageTextbox.val('')
		});
	});

	var locationButton = jQuery('#send-location');
	locationButton.on('click', function(){
		if (!navigator.geolocation){
			return alert('Geolocation not supported by your browser.');
		}

		locationButton.attr('disabled', 'disabled').text('Sending location...');

		navigator.geolocation.getCurrentPosition(function (position){
			locationButton.removeAttr('disabled').text('Send location');
			socket.emit('createLocationMessage', {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			});
		}, function (){
			locationButton.removeAttr('disabled').text('Send location');
			alert('Unable to fetch location');
		});		
	});