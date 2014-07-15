


var handler = module.exports;
var gamePlayers = {};
var palyerNumber = 0;

var Player = function(args){
	this.uid = args.uid;
	this.sid = args.sid;
	this.username = args.username;
	this.diamond = args.diamond;
	this.goldCoin = args.goldCoin;
}


handler.playerEntry = function(player, callback){

}

handler.playerLeave = function(){

}

handler.playerLeaveRoom = function(){

}

handler.getPlayer = function(userId, callback){
	var player = gamePlayers[userId];
	if (player){
		callback(null, player);
	}
	else {
		callback(false, player);
	}
}
