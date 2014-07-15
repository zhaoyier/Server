var XXRoom = require('../domain/xxRoom');
var message = require('../consts/message');
var userDao = require('../dao/userDao');

//var logger = require('pomelo-logger').getLogger(__filename);

var handler = module.exports;
var gameObjDict = {};
var gameRoomId = 0;
var playerCounter = 0;

/*
*function: 创建房间
*argument: args: {userId: 0, playerName: '', playerAccount: 0, playerAvatar: ''}
**/
handler.createRoom = function (args) {
	var roomObj = new XXRoom(++gameRoomId);
	var result = roomObj.addPlayer(args, true);

	if (result === message.ROOM.JOIN_ROOM_RET_CODE.OK){
		gameObjDict[roomObj.roomId] = roomObj;
	}

	return roomObj.getRoomId();
}

handler.getPlayerCardsById = function(args, callback){
	var roomObj = gameObjDict[args.roomId];
	if (!roomObj){
		return callback(-1);
	}
	else {
		return callback(null, {cardsData: roomObj.getPlayerCardsDataById(args.userId), counter: roomObj.getPlayerNum()});
	}
}

handler.getRoomMemberInfoById = function(roomId, callback){
	var roomObj = gameObjDict[roomId];
	if (!roomObj){
		return callback(-1);
	}
	else {
		return callback(null, {cardData: roomObj.getPlayerCardsDataById(), counter: roomObj.getPlayerNum()});
	}
}

handler.getRoomById = function(roomId){
	var roomObj = gameObjDict[roomId];
	return roomObj || null;
}

handler.disbandRoomById = function(roomId){
	var roomObj = gameObjDict[roomId];

	if (!roomObj){
		return {result: message.ROOM.FAILED};
	}

	var ret = roomObj.disbandRoom();
	if (ret.result){
		delete gameObjDict[roomId];
	}
	return ret;
}

handler.tryToDisbandRoom = function(roomObj){
	if (!roomObj.isRoomHasMember()){
		delete gameObjDict[roomObj.roomId];
	}
}

/*
*function: 
*parameters: args: {roomId, userId, username, amount, userAvatar}
**/
handler.applyJoinRoom = function(args){
	var result = message.ROOM.FAILED;
	if (!args || !args.roomId){
		return {result: result};
	}
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		if (roomObj.isRoomHasPosition() && !roomObj.isPlayerInRoom(args.userId)){
			roomObj.addPlayer({userId: args.userId, playerName: args.username, playerAccount: args.amount, playerAvatar: args.userAvatar});
			result = message.ROOM.OK;
		}
	}
	return {result: result};
}

handler.updateMemberInfo = function(args){
	var result = consts.ROOM.FAILED;
	if (!args || !args.roomId){
		return {result: result};
	}

	var roomObj = gameObjDict[args.roomId];
	if (roomObj && roomObj.updatePlayerCardStatus(args)){
		result = message.ROOM.OK;
	}
	return {result: result};
}

handler.getOptimalRoomId = function(args){
	for (var i in gameObjDict) {
		var roomObj = gameObjDict[i];
		if (roomObj && roomObj.isRoomHasPosition()){
			var ret = this.addPlayer(args);
			return roomObj.getRoomId();
		}
	}

	return this.createRoom(args);
}

handler.getRoomInfomation = function(roomId, userId){
	var roomObj = gameObjDict[roomId];
	if (!roomObj){
		return {};
	}
	else {
		var roomInfo = {};
		roomInfo['roomId'] = roomObj.getRoomId();
		roomInfo['counter'] = roomObj.getPlayerNum();
		roomInfo['countdown'] = roomObj.getCountdown();
		roomInfo['players'] = [];
		var players = roomObj.getPlayersDataInfo();
		for (var i = 0; i < players.length; i++) {
			if (players[i].userId === userId){
				roomInfo['players'][i] = {userId: players[i]['userId'], playerName: players[i]['playerName'], playerAccount: players[i]['playerAccount'], 
					playerAvatar: players[i]['playerAvatar'], playerNo: players[i]['playerNo'], playerCards: players[i]['playerCards'], cardStatus: players[i]['cardStatus'],
					cardsPattern: players[i]['cardsPattern'], playerStatus: players[i]['playerStatus']};
			}
			else {
				/*roomInfo['players'][i] = {userId: players[i]['userId'], playerName: players[i]['playerName'], playerAccount: players[i]['playerAccount'], 
					playerAvatar: players[i]['playerAvatar'], playerNo: players[i]['playerNo'], playerCards: [], cardStatus: players[i]['cardStatus'],
					cardsPattern: 0, playerStatus: players[i]['playerStatus']};*/
				roomInfo['players'][i] = {userId: players[i]['userId'], playerName: players[i]['playerName'], playerAccount: players[i]['playerAccount'], 
					playerAvatar: players[i]['playerAvatar'], playerNo: players[i]['playerNo'], playerCards: players[i]['playerCards'], cardStatus: players[i]['cardStatus'],
					cardsPattern: players[i]['cardsPattern'], playerStatus: players[i]['playerStatus']};
			}
		}
		return roomInfo;
	}
}

handler.getPlayerCounter = function(){
	return playerCounter;
}

/*
*function: 
*parameters: {roomId, ownId, otherId, initiative}
**/
handler.getCompareCardSize = function(args) {
	var roomObj = gameObjDict[args.roomId];
	if (!roomObj){
		return -1;
	}
	else {
		return roomObj.getCompareCardsSize(args);
	}
}

/*
*function: 
*parameters: {roomId: 0, userId: 0, amount: 0}
**/
handler.setPlayerBetMoney = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (!roomObj){
		//todo: console.log("error");
		return -1;
	} else {
		roomObj.setRoomFund(args.amount);
	}
}

/*
*function: 结算
*parameters: {roomId};
**/
handler.doClearXXGame = function(args){
	var  roomObj = gameObjDict[args.roomId];
	if (!roomObj){
		return -1;
	}
	else {
		return roomObj.doClearXXGame();
	}
}
/*
*function: 
*parament: {roomId, userId, initiative}
*return: 0 找不到房间, 
**/
handler.getGuzhuyizhiResult = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		return roomObj.getGuzhuyizhiResult(args.userId, args.initiative);
	} 

	return null;
}

/*
*function: 更新卡牌状态
*parameters: {roomId, userId, cardStatus}
**/
handler.updateRoomPlayerCardStatus = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		return roomObj.updatePlayerCardStatus({userId: args.userId, cardStatus: args.cardStatus});
	} else {
		return false;
	}
}

/*
*function: 判断游戏是否可以开始
*parameters: {roomId}
*return: 
**/
handler.checkGameStartConditon = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (!roomObj){
		return false;
	} else {
		//判断房间状态
		if (roomObj.getRoomStatus() === true){
			return false;
		}
		//todo: 判断时间点
		if (roomObj.getCountdown() <= Date.now()){
			//todo: 判断房间人数
			if (roomObj.getPlayerNum() >= 2){
				roomObj.setRoomStatus();
				return true;
			}
			else {
				roomObj.updateCountdown();
				return false;
			}
		}
		
		return false;
	}	
}
/*
*function: 获取房间玩家ID
*param: {roomId}
*/
handler.getRoomUserIdById = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		return roomObj.getXXRoomUsersId();
	}
	else {
		return null;
	}
}

/*
*function: 获取房间玩家ID
*param: {roomId}
*///getRoomUserIdByRoomId
handler.getRoomUserIdByRoomId = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		return roomObj.getXXRoomUsersId();
	}
	else {
		return null;
	}
}


/*
*function: 判断活跃用户数
*param: {roomId} 
**/
handler.checkRoomActiveStatus = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		if (roomObj.getActivePlayerNum() === 1){
			return false;
		}
	}
	return true;
}

/*
*function: 初始化房间信息
*param: {roomId}
**/
handler.initXXRoomGame = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		var res = roomObj.getPlayerNum();
		if (res >= 2){
			return roomObj.initStartGame();
		}		
	}
	return false;
}
/*
*function: 查询资金
*param: {roomId}
**/
handler.queryRoomFund = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		return roomObj.getRoomFund();
	}
	return 0;
}

/*
*function: 查询房间所有玩家基本信息
*param: {roomId}
**/
handler.queryRoomAllUserBasicAsId = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		return roomObj.getUserBasicInfo();
	}
	return null;
}

/*
*function: 游戏结算，获取房间信息
**/
handler.queryClearingXXRoomPlayers = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		return roomObj.getPlayerClearingInfo();
	}
	return null;
}

/*
*function: 删除房间
**/
handler.deleteXXGameRoom = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		//todo: 删除该房间
		delete gameObjDict[args.roomId];
		return true;
	}
	return false;
}

/*
*function: 退出房间
*param: {roomId, userId}
**/
handler.deleteUserXXGameRoom = function(args){
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		if (roomObj.getPlayerNum() !== 1){
			return roomObj.deleteRoomPlayer(args.userId);
		}
		else {
			delete gameObjDict[args.roomId];
		}
	}
	return null;
}

/*
*function: 获取房间获胜者
*param: {roomId}
**/
handler.queryRoomWinner = function(args){
	var roomObj = gameObjDict[args.roomObj];
	if (roomObj){
		return roomObj.getWinner();
	}
	return null;
}

