var XXRoom = require('./XXRoom');
var message = require('./message');

//var logger = require('pomelo-logger').getLogger(__filename);

var handler = module.exports;
var gameObjDict = {};
var gameRoomId = 0;

handler.createRoom = function (args) {
	var roomObj = new XXRoom(++gameRoomId);
	var result = roomObj.addPlayer(args, true);

	if (result === message.ROOM.JOIN_ROOM_RET_CODE.OK){
		gameObjDict[roomObj.roomId] = roomObj;
	}

	return {result: result, roomId: roomObj.roomId};
}

handler.getRoomCardsById = function(args, callback){
	var roomObj = gameObjDict[args.roomId];
	if (!roomObj){
		return callback(-1);
	}
	else {
		return callback(null, {cardData: roomObj.getPlayerCardsData(args.playerId), counter: roomObj.getPlayerNum()});
	}
}

handler.getRoomMemberInfoById = function(roomId, callback){
	var roomObj = gameObjDict[roomId];
	if (!roomObj){
		return callback(-1);
	}
	else {
		return callback(null, {cardData: roomObj.getPlayerCardsData(), counter: roomObj.getPlayerNum()});
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

handler.leaveRoomById = function(playerId, roomId, callback){
	var roomObj = gameObjDict[roomId];
	if (!roomObj){
		//utils.invokeCallback(cb, null, {result: consts.ROOM.FAILED});
		return;
	}

	roomObj.removePlayer(playerId);
	if (!roomObj.isRoomHasMember()){
		delete gameObjDict[roomObj.roomId];
	}
}

handler.applyJoinRoom = function(args){
	var result = message.ROOM.FAILED;
	if (!args || !args.roomId){
		return {result: result};
	}
	var roomObj = gameObjDict[args.roomId];
	if (roomObj){
		if (roomObj.isRoomHasPosition() && !roomObj.isPlayerInRoom(args.playerId)){
			roomObj.addPlayer({playerId: args.playerId, tableId: args.tableId});
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
			return {result: message.ROOM.JOIN_ROOM_RET_CODE.OK, roomId: roomObj.getRoomId()};
		}
	}

	return this.createRoom(args);

}
