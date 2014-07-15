var xxLogic = require('../domain/game/xxLogic');
var xxHandler = require('../servers/room/handler/xxHandler');
//var poker = require('./constPoker');

/*var roomObj = new Room(100);

roomObj.addPlayer({playerId:101, tableId: 200}, true);

for (var i = 0; i < roomObj.playerDataArray.length; i++) {
	console.log("***********************************:\t", roomObj.playerDataArray[i].playerId, roomObj.playerDataArray[i].tableId, roomObj.playerDataArray[i].cardsPattern);
	for (var j = 0; j < roomObj.playerDataArray[i].playerCards.length; j++) {
		var cardColor = xxLogic.getCardColor(roomObj.playerDataArray[i].playerCards[j]);
		var cardValue = xxLogic.analyseCardValue(roomObj.playerDataArray[i].playerCards[j]);
		console.log(cardColor, cardValue);
	}
}*/

//var handler = game.createRoom({playerId: 10000, tableId: 2});
//console.log(handler);
/*game.applyJoinRoom({roomId: handler.roomId, playerId: 10001, tableId:2});
game.getRoomCardsById({roomId: 1, playerId: 10001}, function(error, result){
	for (var j = 0; j < result.cardData.playerCards.length; j++) {
		var cardColor = xxLogic.getCardColor(result.cardData.playerCards[j]);
		var cardValue = xxLogic.analyseCardValue(result.cardData.playerCards[j]);
		console.log(cardColor, cardValue);
	}
	console.log("counter:\t", result.cardData.cardsPattern);
})*/
//console.log(game.getRoomCardsById(1));

xxHandler.enterGameRoom({}, {}, function(error, result){
	//console.log(result['players']);
	xxHandler.comparePlayerCardsSize({teamId:1, ownId:110, otherId: 111, initiative: true},{}, function(error, result){
		console.log(error, result);
	})
})









