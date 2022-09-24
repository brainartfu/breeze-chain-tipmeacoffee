const socket = require('socket.io');
const axios = require('axios')
const cookie = require('cookie')
let onlineUsers = {};
let socketServer = {};
let postUsers = [];
socketServer.updateTime = new Date().getTime() - 100000;
const refreshUsers = async () => {
	let postsAPI = await axios.get('https://api.breezechain.org/new/0');

	if (postsAPI.data.length > 0) postsAPI.data.map((pp) => {
		if (postUsers.indexOf(pp.author) == -1) postUsers.push(pp.author)
		return;
	})
};
refreshUsers();
socketServer.init = (server) => {
	socketServer.io = socket(server);
	socketServer.io.on('connection', (socket) => {
		const cookief = socket.handshake.headers.cookie; 
		if (cookief) {
		    const cookies = cookie.parse(socket.handshake.headers.cookie);
		    if (cookies) {
			    socket.cookies = cookies;
			    onlineUsers[socket.cookies.breeze_username] = socket.id;
		    	socketServer.io.emit('broadcast', {type: 'new', user: socket.cookies.breeze_username});
		    	socket.emit('users', {type: 'userlist', users: postUsers, you: socket.cookies.breeze_username})
		    }
		}
		socket.on('message', async (data) => {
			if(socket.cookies && socket.cookies.breeze_username && socket.cookies.breeze_username !=='' && socket.cookies.token && socket.cookies.token !==''  && await global.validateToken(socket.cookies.breeze_username, socket.cookies.token)) 
		  	{
		  		loguser = socket.cookies.breeze_username; 
		  		const actAPI = await getAccount(loguser);
		  		if (data.data.match(/@[^\s]+/g) !== null) {  //if true, only mentioned user can see the message.
		  			// let senduser = data.data.match(/@[^\s]+/g)[0];
		  			let matchs = data.data.match(/@[^\s]+/g);
		  			matchs = [...new Set(matchs)];
		  			await Promise.all(
			  			matchs.map(async (senduser)=> {
				  			console.log(senduser);
				  			senduser1 = senduser.slice(1, senduser.length);
					  		const mentionuser = await getAccount(senduser1);
					  		if (mentionuser) {
					  			// console.log(data.data)
					  			const regexp = new RegExp(senduser, 'g');
					  			data.data = data.data.replace(regexp, `<a href="/profile/${senduser1}">${senduser}</a>`);
					  			console.log(data.data, senduser)
					  		}
				  			console.log(senduser1);
				  			// if (onlineUsers[senduser1]) {
				  			// 	console.log(socketServer.io.sockets.sockets[onlineUsers[senduser1]])
				  			// 	socketServer.io.sockets.sockets.get(onlineUsers[senduser1]).emit('newMessage', {type: 'direct', data: data, user: {avatar: actAPI.json?actAPI.json.profile.avatar:'/images/user.png', name: actAPI.name}})
				  			// 	socket.emit('newMessage', {type: 'broadcast', data: data, user: {avatar: actAPI.json?actAPI.json.profile.avatar:'/images/user.png', name: actAPI.name}})
				  			// } else {
					  		// 	console.log('offline');
				  			// 	socket.emit('error', {data: 'Sorry. '+senduser1+' is offline.'})
				  			// }
			  			})
		  			) 
					socketServer.io.emit('newMessage', {data: data, user: {type:'broadcast', avatar: actAPI.json?actAPI.json.profile.avatar:'/images/user.png', name: actAPI.name}})
		  		} else {

					socketServer.io.emit('newMessage', {data: data, user: {type:'broadcast', avatar: actAPI.json?actAPI.json.profile.avatar:'/images/user.png', name: actAPI.name}})
		  		}
		  	} else {
		  		socket.emit('error', {data: 'phew.. User Validation Fails. You must be login'})
		  	}
		})
		socket.on('disconnect', () => {
			if (onlineUsers[socket.cookies.breeze_username]) {
				socketServer.io.emit("broadcast", {type: 'delete', user: socket.cookies.breeze_username})
				delete onlineUsers[socket.id];
			}
		})
	});
}
socketServer.update = async () => {
	//console.log('update')
	// let postsAPI = await axios.get(api_url+`/new/0`);
	let postsAPI = await axios.get(api_url+`/trending?after=${socketServer.updateTime}`);
	//console.log(postsAPI.data.length)
	let _update = socketServer.updateTime;
	let _finalData = [];
	if (postsAPI.data.length > 0) {
		await Promise.all(
			postsAPI.data.map(async (post) => {
				if (post.ts > socketServer.updateTime) {
					_update = post.ts> _update?post.ts:_update;
					if (postUsers.indexOf(post.author) === -1) {
						postUsers.shift();
						postUsers.push(post.author);
					}
					let userAPI = await axios.get(api_url+`/account/${post.author}`); 
					_finalData.push({ ...post, user: userAPI.data.json || false });
				}
			})
		)
	}
	//console.log( _finalData.length, _update, socketServer.updateTime);
	if (_finalData.length > 0) {
		socketServer.updateTime = _update + 100;
		socketServer.io.emit('tmac', {data: _finalData});
	}
}

module.exports = socketServer;