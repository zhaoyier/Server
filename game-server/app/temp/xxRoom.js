var xxLogic = require('./xxLogic');
var message = require('./message');
var poker = require('./pokerData');

var MAX_MEMBER_NUM = 5;
var MAX_CARD_NUM = 3;
function XXRoom(roomId) {
	this.roomId = roomId;
	this.roomName = message.ROOM.DEFAULT_NAME;
	this.playerCounter = 0;
	this.playerDataArray = new Array(MAX_MEMBER_NUM);
	this.poker = poker.getXXPokerList();

	//this.channel = createChannel();
	this.channel = 1;

	var _this = this;

	var init = function(){
		_this.roomId = roomId;
		var arr = _this.playerDataArray;
		for (var i = 0; i < arr.length; i++) {
			arr[i] = {playerId: message.ROOM.PLAYER_ID_NONE, playerName: '', playerAccount: 0, playerAvatar:'', playerNo: 0,
				tablePattern: message.ROOM.TABLE_PATTERN_NONE, playerCards: [], cardStatus: message.ROOM.PLAYER_CARD_STATUS.POSSESS,
				cardsPattern: message.ROOM.PLAYER_INFO_NONE, playerStatus: message.ROOM.PLAYER_INACTIVITY};
		}
		_this.createChannel();
	};

	init();
}

XXRoom.prototype.createChannel = function(){
	if (this.channel){
		return this.channel;
	}

	var channelName = '';
	//this.channel = pomelo.app.get('channelService').getChannel(channelName, true);
	if (this.channel){
		return this.channel;
	}
	return null;
}

/*
*function: 加入用户
*argument: args: {playerId: 0, playerName: '', playerAccount: 0, playerAvatar: ''}
**/
function doAddPlayer(roomObj, args, playerNo, poker){
	var arr = roomObj.playerDataArray;
	for (var i in roomObj.playerDataArray) {
		if (roomObj.playerDataArray[i].playerId === message.ROOM.PLAYER_ID_NONE){
			var handCards = xxLogic.initPlayHandCards(poker);
			roomObj.playerDataArray[i] = {playerId: args.playerId, playerName: args.playerName, playerAccount: args.playerAccount, playerAvatar: args.playerAvatar,
				playerNo: playerNo, playerCards: handCards.cards, cardsPattern:handCards.pattern, cardStatus: message.ROOM.PLAYER_CARD_STATUS.NOTDISPLAY,
				playerStatus: message.ROOM.PLAYER_ACTIVITY, playerSeat: roomObj.playerCounter-1};
			return true;
		}
	}
	return false;
}

/*
*function: 加入用户
*argument: args: {playerId: 0, playerName: '', playerAccount: 0, playerAvatar: ''}
**/
XXRoom.prototype.addPlayer = function(args, isCaptain){

	isCaptain = isCaptain||false;
	if (this.isPlayerInRoom(args.playerId)){
		return message.ROOM.JOIN_ROOM_RET_CODE.ALREADY_IN_ROOM;
	}
	if (!this.playerCounter < MAX_MEMBER_NUM){
		this.playerCounter++;
	}

	if (!doAddPlayer(this, args, this.playerCounter-1, this.poker)){
		return message.ROOM.JOIN_ROOM_RET_CODE.SYS_ERROR;
	}

	return message.ROOM.JOIN_ROOM_RET_CODE.OK;
}

XXRoom.prototype.removePlayer = function(playerId, callback){
	for (var i = 0; i < this.playerDataArray.length; i++) {
		if (this.playerDataArray[i].playerId === playerId){
			this.playerCounter -= 1;
			this.playerDataArray[i].playerId = message.ROOM.PLAYER_ID_NONE;
			this.playerDataArray[i].playerStatus = message.ROOM.PLAYER_INACTIVITY;
			//return callback(null, {code: 200});
			return this.playerCounter;
		}
	}
	return this.playerCounter;
	//return callback(-1, {code: 201});
}

XXRoom.prototype.updatePlayerCardStatus = function(data){
	if (data.cardStatus === message.ROOM.PLAYER_CARD_STATUS.ABANDON){
		for (var i = 0; i < this.playerDataArray.length; i++) {
			if (this.playerDataArray[i].playerId === data.playerId){
				this.playerDataArray[i].cardStatus = message.ROOM.PLAYER_CARD_STATUS.ABANDON;
				return true;		
			}
		}
	}
	else if (data.cardStatus === message.ROOM.PLAYER_CARD_STATUS.DISPLAY){
		for (var i = 0; i < this.playerDataArray.length; i++) {
			if (this.playerDataArray[i].playerId === data.playerId){
				this.playerDataArray[i].cardStatus = message.ROOM.PLAYER_CARD_STATUS.DISPLAY;
				return true;		
			}
		}
	}

	return false;
}

XXRoom.prototype.disbandRoom = function(){
	//if (this.playerCounter === 0){}
}

XXRoom.prototype.getPlayerNum = function(){
	return this.playerCounter;
}

XXRoom.prototype.getRoomId = function(){
	return this.roomId;
}

XXRoom.prototype.isRoomHasMember = function(){
	return this.getPlayerNum() > 0;
}

XXRoom.prototype.isRoomHasPosition = function(){
	return this.getPlayerNum() < MAX_MEMBER_NUM;
}

XXRoom.prototype.getPlayersDataInfo = function(){
	return this.playerDataArray;
}

XXRoom.prototype.isPlayerInRoom = function(playerId){
	var players = this.playerDataArray;
	for (var i in players) {
		if (players[i].playerId != message.ROOM.PLAYER_ID_NONE && players[i].playerId === playerId){
			return true;
		}
	}
	return false;
}

XXRoom.prototype.getPlayerCardsDataById = function(playerId) {
	for (var i in this.playerDataArray) {
		if ((this.playerDataArray[i].playerId != message.ROOM.PLAYER_ID_NONE) && (this.playerDataArray[i].playerId === playerId)){
			return this.playerDataArray[i];
		}
	}
	return null;
}

module.exports = XXRoom;
