module.exports = Player;

var Player = function(args){
	this.uid = args.uid;
	this.sid = args.sid;
	this.username = args.username;
	//this.diamond = args.diamond;
	//this.goldCoin = args.goldCoin;
}

Player.prototype.getUid = function() {
	return this.uid;
};

Player.prototype.setUid = function(uid){
	this.uid = uid;
}

Player.prototype.

