var constPoker = require('../../consts/poker');
var staticPoker = require('../poker/staticPoker');

var handler = module.exports;

/*
*function: 洗牌
*/
handler.shuffle = function(){
	var pokerCards = staticPoker.getXPokerList();
	for (var i = 0; i < pokerCards.length; i++) {
		var index = parseInt(Math.random()*pokerCards.length);
		var temp = pokerCards[i];
		pokerCards[i] = pokerCards[index];
		pokerCards[index] = temp;
	}
	return pokerCards;
}

/*
*function: 初始化卡牌数组
*/
handler.initGameCards = function(){
	//洗牌
	var cardsList = this.shuffle();

	//卡牌分组
	var handsList = [];
	for (var i = 0; i < constPoker.XStaticNumber.MAX_HAND_NUM; i++) {
		for (var j = 0; j < constPoker.XStaticNumber.HAND_CARDS_NUM; j++) {
			handsList[i].cards.push(cardsList.pop());
		}
		handsList[i].patterns = analyseCardsPatterns(handsList[i].cards);
	}

	return handsList;
};

/*
*function: 分析手牌牌型
*/
handler.analyseCardsPatterns = function (handCards) {
	this.sortCardsList(handCards);

	/*
	*description: 判断手牌数量
	*/
	if (handCards.length != poker.XStaticNumber.HAND_CARDS_NUM){
		return poker.XType.POKER_X_ERROR;
	}
	/*
	*description: 分析235
	*/
	if ((this.getCardValue(handCards[0])===2) && (this.getCardValue(handCards[1])===3) && (this.getCardValue(handCards[2])===5)) {
		return poker.XType.POKER_X_SPECIAL;
	}	

	/*
	*description: 分析豹子
	*/
	if ((this.getCardValue(handCards[0]) === this.getCardValue(handCards[1])) 
		&& (this.getCardValue(handCards[1])=== this.getCardValue(handCards[2]))){
		return poker.XType.POKER_X_BAO_ZI;	
	}

	/*
	*description: 分析对子类型
	*/
	if ((this.getCardValue(handCards[0]) === this.getCardValue(handCards[1])) 
		|| (this.getCardValue(handCards[0])=== this.getCardValue(handCards[2]))
		|| (this.getCardValue(handCards[1])=== this.getCardValue(handCards[2]))) {
		return poker.XType.POKER_X_DOUBLE;	
	}

	/*
	*description：分析金花类型
	*/
	if ((this.getCardColor(handCards[0]) === this.getCardColor(handCards[1]))
		&& (this.getCardColor(handCards[0]) === this.getCardColor(handCards[2]))) {
		if (((this.getCardValue(handCards[0]) === 1) 
			&& (this.getCardValue(handCards[1]) === 2))
			&& (this.getCardValue(handCards[2]) === 3)) {
			return poker.XType.POKER_X_SHUN_JIN;
		}
		else if ((this.getCardLogicValue(handCards[0]) === 14)
			&& (this.getCardLogicValue(handCards[1]) === 12)
			&& (this.getCardLogicValue(handCards[2]) === 13)) {
			return poker.XType.POKER_X_SHUN_JIN;
		}
		else if (((this.getCardLogicValue(handCards[0])+1) === this.getCardLogicValue(handCards[1]))
			&& ((this.getCardLogicValue(handCards[1])+1) === this.getCardLogicValue(handCards[2]))) {
			return poker.XType.POKER_X_SHUN_JIN;
		}
		else {
			return poker.XType.POKER_X_JIN_HUA;
		}
	}

	/*
	*description：分析顺子类型
	*/
	if ((this.getCardValue(handCards[0])===1)
		&& (this.getCardValue(handCards[1])===12) 
		&& (this.getCardValue(handCards[2])===13)) {
			return poker.XType.POKER_X_SHUN_ZI;
	}
	else if (((this.getCardValue(handCards[0])+1)===(this.getCardValue(handCards[1]))) 
		&& ((this.getCardValue(handCards[1])+1)===(this.getCardValue(handCards[2])))) {
		return poker.XType.POKER_X_SHUN_ZI;
	}
	/*
	*description: 判断为单张
	*/
	return poker.XType.POKER_X_SINGLE;
}

/*
*function: 卡牌排序
*/
this.sortCardsList = function(handCards){
	var handCardsValue = [];
	for (var i = 0; i < handCards.length; i++) {
		handCardsValue.push(this.getCardValue(handCards[i]));	
	}

	for (var i = 0; i < handCardsValue.length; i++) {
		for (var j = 0; j < handCardsValue.length-i; j++) {
			if (handCardsValue[j] > handCardsValue[j+1]){
				var tempValue = handCardsValue[j];
				handCardsValue[j] = handCardsValue[j+1];
				handCardsValue[j+1] = tempValue;
				var tempCard = handCards[j];
				handCards[j] = handCards[j+1];
				handCards[j+1] = tempCard;
			}
		}
	}
}

/*
*function: 计算逻辑数值
*/
this.getCardLogicValue = function(handCard){
	var cardValue = this.getCardValue(handCard);
	return (cardValue===1)?(cardValue+13):cardValue;
}

/*
*function: 分析卡牌大小
*/
this.getCardValue = function(handCard){
	return handCard&poker.PokerMask.POKER_MASK_VALUE;
}

/*
*function: 分析卡牌花色
*/
this.getCardColor = function(handCard){
	return handCard&poker.PokerMask.POKER_MASK_COLOR;
}

//对比扑克
this.compareCard = function(firstHandCards, nextHandCards){
	//TODO: 判断卡牌张数是否满足基本条件
	if ((firstHandCards.length != poker.XStaticNumber.HAND_CARDS_NUM) 
		|| (nextHandCards.length != poker.XStaticNumber.HAND_CARDS_NUM)) {
		return -1;
	}
	var firstCardsType = this.getCardsType(firstHandCards);
	var nextCardsType = this.getCardsType(nextHandCards);
	if ((firstCardsType-nextCardsType) != 0){
		//console.log("here");
		return firstCardsType>nextCardsType?1:0;
	}
	else {
		this.sortCardsList(firstHandCards);
		this.sortCardsList(nextHandCards);

		switch(firstCardsType){
			case poker.XType.POKER_X_SINGLE:
			case poker.XType.POKER_X_SHUN_ZI:
			case poker.XType.POKER_X_JIN_HUA:
			case poker.XType.POKER_X_SHUN_JIN:
			case poker.XType.POKER_X_BAO_ZI:
			{
				console.log("here", firstCardsType);
				if (this.getCardValue(firstHandCards[2]) != this.getCardValue(nextHandCards[2])) {
					console.log("here ? :");
					return this.getCardValue(firstHandCards[2])>this.getCardValue(nextHandCards[2])?1:0;
				}
				else {
					/*
					*TODO: 根据花色比较
					*/
					var firstMaxCardColor = this.getCardColor(firstHandCards[2]);
					var nextMaxCardColor = this.getCardColor(nextHandCards[2]);
					console.log("here color: ", firstMaxCardColor, nextMaxCardColor);
					return firstMaxCardColor>nextMaxCardColor?0:1;
					/*
					*TODO: 根据出牌先后比较
					*/
					//return 1;
				}
			}
			case poker.XType.POKER_X_DOUBLE:
			{
				console.log("here", firstCardsType);
				var firstDoubleCardValue = (this.getCardLogicValue(firstHandCards[0])===this.getCardLogicValue(firstHandCards[1]))?this.getCardLogicValue(firstHandCards[0]):this.getCardLogicValue(firstHandCards[1]);
				var nextDoubleCardValue = this.getCardLogicValue(nextHandCards[0])===this.getCardLogicValue(nextHandCards[1])?this.getCardLogicValue(nextHandCards[0]):this.getCardLogicValue(nextHandCards[1]);
				if (firstDoubleCardValue != nextDoubleCardValue){
					console.log("here ? :");
					return (firstDoubleCardValue>nextDoubleCardValue) ? 1 : 0;
				}
				else {
					/*
					*根据花色比较
					*/
					var firstDoubleCardColor = (this.getCardValue(firstHandCards[0])===this.getCardValue(firstHandCards[1]))?this.getCardColor(firstHandCards[0]):this.getCardColor(firstHandCards[1]);
					var nextDoubleCardColor = this.getCardValue(nextHandCards[0])===this.getCardValue(nextHandCards[1])?this.getCardColor(nextHandCards[0]):this.getCardColor(nextHandCards[1]);
					console.log("here double color: ", firstDoubleCardColor, nextDoubleCardColor);
					return (firstDoubleCardColor>nextDoubleCardColor)?0:1;
					/*
					*根据先后比较
					*/
					//return 1;
				}
			}
			case poker.XType.POKER_X_SPECIAL:
			{
				console.log("here", firstCardsType);
				var firstMaxCardColor = this.getCardColor(firstHandCards[2]);
				var nextMaxCardColor = this.getCardColor(nextHandCards[2]);
				console.log("here special: ", firstMaxCardColor, nextMaxCardColor);
				return (firstMaxCardColor>nextMaxCardColor)?0:1;
			}
		}
	}
}