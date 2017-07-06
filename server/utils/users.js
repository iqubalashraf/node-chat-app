class Users {
  constructor () {
    this.users = [];
  }
  addUser (id, name, room) {
    var user = {id, name, room};
    this.users.push(user);
    return user;
  }
  removeUser (id) {
    var user = this.getUser(id);

    if (user) {
      this.users = this.users.filter((user) => user.id !== id);
    }

    return user;
  }
  getUser (id) {
    return this.users.filter((user) => user.id === id)[0]
  }
  getUserList (room) {
    var users = this.users.filter((user) => user.room === room);
    var namesArray = users.map((user) => user.name);

    return namesArray;
  }
  getRoomList(){
  	var roomNameArray = this.users.map((user) => user.room);
  	var filteredArray=[];

	for (var i = roomNameArray.length - 1; i >= 0; i--) {
		var add = true;
		for (var j = filteredArray.length - 1; j >= 0; j--) {
			if(roomNameArray[i] === filteredArray[j]){
				add = false;
				break;
			}
		}
		if(add){
			filteredArray.push(roomNameArray[i]);
		}
	}

  	return filteredArray;
  }
}

module.exports = {Users};