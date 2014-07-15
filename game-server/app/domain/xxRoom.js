var xxLogic = require('./game/xxLogic');
var message = require('../consts/message');
var poker = require('../dao/statics/poker');

var MAX_MEMBER_NUM = 5;
var MAX_CARD_NUM = 3;
/*
*function: 
*parameters: Countdown: 倒计时,
**/
function XXRoom(roomId) {
	this.roomId = roomId;
	this.roomName = message.ROOM.DEFAULT_NAME;
	this.playerCounter = 0;
	this.activePlayerNum = 0;
	this.betFund = 0;
	this.roomStatus = false;
	this.countdown = Date.now()+30000;					//开始游戏倒计时
	this.userArray = new Array(MAX_MEMBER_NUM);
	this.poker = poker.getXXPokerList();
	

	//this.channel = createChannel();
	this.channel = 1;

	var _this = this;

	var init = function(){
		_this.roomId = roomId;
		var arr = _this.userArray;
		for (var i = 0; i < arr.length; i++) {
			arr[i] = {
				userNo: i,												//编号
				userId: message.ROOM.PLAYER_ID_NONE, 					//用户id
				username: '', 											//用户名
				userAvatar:'', 											//用户头像
				userAccount: 0, 										//用户帐户
				userBetFund: 0,											//用户资金
				roomPattern: message.ROOM.TABLE_PATTERN_NONE,			//房间类型
				userCards: [], 											//卡牌
				cardPattern: message.ROOM.PLAYER_INFO_NONE, 			//卡牌类型
				cardStatus: message.ROOM.PLAYER_CARD_STATUS.POSSESS,	//卡牌状态
				userStatus: message.ROOM.PLAYER_STATUS.NEW				//用户状态
			};			
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
*argument: args: {roomId, userId, username, amount, userAvatar}
**/
function doAddPlayer(roomObj, args, poker){
	for (var i in roomObj.userArray) {
		if (roomObj.userArray[i].userId === message.ROOM.PLAYER_ID_NONE){
			var handCards = xxLogic.initPlayHandCards(poker);
			var userNo = roomObj.userArray[i].userNo;
			roomObj.userArray[i] = {userId: args.userId, username: args.username, userAccount: args.amount, userAvatar: args.userAvatar,
				userNo: userNo, userCards: handCards.cards, cardPattern:handCards.pattern, cardStatus: message.ROOM.PLAYER_CARD_STATUS.NOTDISPLAY,
				userStatus: message.ROOM.PLAYER_ACTIVITY, playerSeat: roomObj.playerCounter-1};
			this.activePlayerNum += 1;
			return true;
		}
	}
	return false;
}

/*
*function: 加入用户
*argument: args: {userId: 0, username: '', userAccount: 0, userAvatar: ''}
**/
XXRoom.prototype.addPlayer = function(args){
	isCaptain = isCaptain||false;
	if (this.isPlayerInRoom(args.userId)){
		return message.ROOM.JOIN_ROOM_RET_CODE.ALREADY_IN_ROOM;
	}
	if (!this.playerCounter < MAX_MEMBER_NUM){
		this.playerCounter++;
	}

	if (!doAddPlayer(this, args, this.poker)){
		return message.ROOM.JOIN_ROOM_RET_CODE.SYS_ERROR;
	}

	return message.ROOM.JOIN_ROOM_RET_CODE.OK;
}

/*
*function: 删除玩家
*/
XXRoom.prototype.deleteRoomPlayer = function(userId){
	for (var i = 0; i < this.userArray.length; i++) {
		if (this.userArray[i].userId === userId){
			this.userArray.splice(i, 1);
		}
	}

	this.playerCounter -= 1;
	this.activePlayerNum -= 1;
	return this.playerCounter;
}


/*
*function: 
*param: {userId, cardStatus}
**/
XXRoom.prototype.updatePlayerCardStatus = function(args){
	if (args.cardStatus === message.ROOM.PLAYER_CARD_STATUS.ABANDON){
		for (var i = 0; i < this.userArray.length; i++) {
			if (this.userArray[i].userId === args.userId){
				if (this.userArray[i].cardStatus >= args.cardStatus){
					return false;
				}
				else {
					this.userArray[i].cardStatus = message.ROOM.PLAYER_CARD_STATUS.ABANDON;
					this.activePlayerNum -= 1;
					return true;
				}
						
			}
		}
	}
	else if (args.cardStatus === message.ROOM.PLAYER_CARD_STATUS.DISPLAY){
		for (var i = 0; i < this.userArray.length; i++) {
			if (this.userArray[i].userId === args.userId){
				if (this.userArray[i].cardStatus >= args.cardStatus){
					return false;
				}
				else {
					this.userArray[i].cardStatus = message.ROOM.PLAYER_CARD_STATUS.DISPLAY;
					return true;	
				}	
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
	return this.userArray;
}

/*
*function: 更新倒计时
*parameters: 
**/
XXRoom.prototype.updateCountdown = function(){
	this.countdown = Date.now()+30000;
}

/*
*function: 获取倒计时
*parameters: 
**/
XXRoom.prototype.getCountdown = function(){
	return this.countdown;
}

XXRoom.prototype.getRoomStatus = function(){
	return this.roomStatus;
}

XXRoom.prototype.setRoomStatus = function(){
	this.roomStatus = true;
}

XXRoom.prototype.isPlayerInRoom = function(userId){
	var players = this.userArray;
	for (var i in players) {
		if (players[i].userId != message.ROOM.PLAYER_ID_NONE && players[i].userId === userId){
			return true;
		}
	}
	return false;
}

XXRoom.prototype.getPlayerCardsDataById = function(userId) {
	for (var i in this.userArray) {
		if ((this.userArray[i].userId != message.ROOM.PLAYER_ID_NONE) && (this.userArray[i].userId === userId)){
			return this.userArray[i];
		}
	}
	return null;
}

XXRoom.prototype.setRoomFund = function(userId, amount){
	this.betFund += amount;
}

XXRoom.prototype.getRoomFund = function(userId, amount){
	return this.betFund;
}

XXRoom.prototype.getActivePlayerNum = function() {
	return this.activePlayerNum;
}

/*
*function: 
*parameters: {ownId, otherId, initiative}
**/
XXRoom.prototype.getCompareCardsSize = function(ownId, otherId, initiative){
	var ownHandCards = {cards: [], pattern: 0}, otherHandCards = {cards: [], pattern:0};
	for (var i = 0; i < this.userArray.length; i++) {
		if (this.userArray[i].userId === ownId){
			ownHandCards['cards'] = this.userArray[i].userCards;
			ownHandCards['pattern'] = this.userArray[i].cardPattern;
			//todo
			console.log("own:\t", ownHandCards);
		}
		else if (this.userArray[i].userId === otherId){
			otherHandCards['cards'] = this.userArray[i].userCards;
			otherHandCards['pattern'] = this.userArray[i].cardPattern;
			//todo
			console.log("other:\t", otherHandCards);
		}
	}
	return xxLogic.getCompareSize(ownHandCards, otherHandCards, initiative);
}


/*
*function: 结算游戏
*param: 
*desc: 
**/
XXRoom.prototype.doClearXXGame = function(){
	this.betFund = 0;
	this.activePlayerNum = 0;

	for (var i = 0; i < this.userArray.length; i++) {
		this.userArray[i].userCards = [];
		this.userArray[i].cardStatus = message.ROOM.PLAYER_CARD_STATUS.POSSESS;
		his.userArray[i].cardPattern = message.ROOM.PLAYER_INFO_NONE;
	}
	return 0;
}

/*
*function: 获取基本信息
*
**/
XXRoom.prototype.getUserBasicInfo = function(){
	var res = [];
	for (var i = 0; i < this.userArray.length; i++) {
		res.push({userId: this.userArray[i].userId, username: this.userArray[i].username, account: this.userArray[i].userAccount, 
			avatar: this.userArray[i].userAvatar});
	}
	return res;
}

/*
*function: 获取玩家清算数据
*param: 
***/
XXRoom.prototype.getPlayerClearingInfo = function(){
	var res = [];
	for (var i = 0; i < this.userArray.length; i++) {
		if (this.userArray[i].userStatus === message.ROOM.PLAYER_STATUS.GAME){
			res.push({userId: this.userArray[i].userId, bet: this.userArray[i].userBetFund});
		}
	}
	return res;
}

/*
*function: 初始化游戏
*
**/
XXRoom.prototype.initStartGame = function(){
	this.playerCounter = this.userArray.length;
	this.activePlayerNum = this.userArray.length;
	this.betFund = 0;
	this.roomStatus = false;
	this.countdown = Date.now()+30000;					//开始游戏倒计时
	this.poker = poker.getXXPokerList();

	for (var i = 0; i < this.userArray.length; i++) {
		var handCards = xxLogic.initPlayHandCards(this.poker);
		this.userArray[i].userNo = i;
		this.userArray[i].userBetFund = 0;
		this.userArray[i].userCards = handCards.cards;
		this.userArray[i].cardPattern = handCards.pattern;
		this.userArray[i].cardStatus = message.ROOM.PLAYER_CARD_STATUS.NOTDISPLAY;
		this.userArray[i].userStatus = message.ROOM.PLAYER_STATUS.NEW;
	}
	return true;
}

/*
*function: 查询房间用户id
**/
XXRoom.prototype.getXXRoomUsersId = function(){
	var res = [];
	for (var i = 0; i < this.userArray.length; i++) {
		if (this.userArray[i].userId !== 0){
			res.push(this.userArray[i].userId);
		}
	}
	return res;
}

/*
*function: 放弃卡牌
**/
XXRoom.prototype.abandonHandCard = function(userId){
	for (var i=0; i<this.userArray.length; ++i){
		if (this.userArray[i].userId === userId){
			this.activePlayerNum -= 1;
			this.userArray[i].cardStatus = message.ROOM.PLAYER_CARD_STATUS.ABANDON;
			this.userArray[i].userStatus = message.ROOM.PLAYER_STATUS.NEW;
		}
	}
}

/*
*function: 获取孤注一掷结果
*param: {userId, initiative}
**/
XXRoom.prototype.getGuzhuyizhiResult = function(userId, initiative){
	for (var i = 0; i < this.userArray.length; i++) {
		if (this.userArray[i].userId !== userId){
			var res = this.getCompareCardsSize(userId, this.userArray[i].userId, initiative});
			if (res === message.XXConstant.LOSE){
				this.abandonHandCard(userId);
				return message.XXConstant.LOSE;
			}
		}	
	}
	return message.XXConstant.WIN;
}

/*
*function: 查询获胜者id
*param: 
**/
XXRoom.prototype.getWinner = function(){
	if (this.activePlayerNum != 1){
		return null;
	}

	this.userArray[i].cardStatus = message.ROOM.PLAYER_CARD_STATUS.POSSESS;
		this.userArray[i].userStatus = message.ROOM.PLAYER_STATUS.NEW;

	for (var i = 0; i < this.userArray.length; i++) {
		if ((this.userArray[i].cardStatus === message.ROOM.PLAYER_CARD_STATUS.NOTDISPLAY || this.userArray[i].cardStatus === message.ROOM.PLAYER_CARD_STATUS.DISPLAY) 
			&& this.userArray[i].userStatus === message.ROOM.PLAYER_STATUS.GAME){
			return this.userArray[i].userId;
		}
	}
	return null;
}


module.exports = XXRoom;
