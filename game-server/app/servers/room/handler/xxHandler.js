/*
*1、进入房间
*2、开始游戏
*3、更新卡牌状态
*4、更新帐户信息
*5、比较大小
*6、游戏结算
*7、离开房间
*8、孤注一掷
**/
var async = require('async');

var userDao = require('../../../dao/userDao');
var gameDao = require('../../../dao/gameDao');
var xxManager = require('../../../services/xxManager');
var message = require('../../../consts/message');
var messageService = require('../../../domain/messageService');

//var handler = module.exports;

module.exports = function(app){
	return new Handler(app);
};

var Handler = function(app){
	this.app = app;
	if (!this.app){
		logger.error(app);
	}
}

/*
*function: 
*param: msg: {roomId, userId, playerName, playerAccount, playerAvatar}
**/
Handler.prototype.enterXXRoom = function(msg, session, next){
	//选择房间
	var roomId = xxManager.getOptimalRoomId({userId: 110, playerName: 'pp', playerAccount: 99, playerAvatar: ''});
	xxManager.applyJoinRoom({roomId: roomId, userId: 111, playerName: 'qq', playerAccount: 101, playerAvatar: ''});
	if (roomId != 0){
		var uids = xxManager.getRoomUserIdByRoomId({roomId: msg.roomId});
		//同步消息
		for (var i = 0; i < uids.length; i++) {
			if (uids[i] !== msg.userId){
				this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId, function(error, sid){
					if (!error){
						messageService.pushMessageToPlayer({uid: uids[i], sid: sid}, 'onPlayerEnterXXGame', xxManager.queryRoomUserBasicAsId(uids[i]));
					}
				})
			}
		}

		next(null, {code: 200, users: xxManager.queryRoomAllUserBasicAsId({roomId: roomId, allUsers: uids})});
	}
	else {
		//todo, 进入/创建房间失败
		return next();
	}
}


/*
*function: 开始游戏
*param: {roomId, userId}
**/
Handler.prototype.startXXGame = function(msg, session, next){
	if (xxManager.checkGameStartConditon(msg)){
		var res = xxManager.initXXRoomGame({roomId: msg.roomId});
		var uids = xxManager.getRoomUserIdByRoomId({roomId: msg.roomId});
		if (uids != null && uids.length >= 1){
			for (var i = 0; i < uids.length; i++) {
				this.app.rpc.chat.chatRemote.getPlayerSid(uids[i], function(error, sid){
					if (!error){
						messageService.pushMessageToPlayer({uid: uids[i], sid: sid}, 'onStartXXGame', {code: 200, status: true});
					}
				})
			}
		}
	}
	else {
		var uids = xxManager.getRoomUserIdByRoomId({roomId: msg.roomId});
		this.app.rpc.chat.chatRemote.getPlayerSid(uids[0], function(error, sid){
			if (!error){
				messageService.pushMessageToPlayer({uid: uids[0], sid: sid}, 'onWaitStartXXGame', {code: 200, status: true});
			}
		})
		//return next(null, {code: 201});
	}
}

/*
*function: 3、更新卡牌状态
*param: {roomId, userId, cardStatus}
**/
Handler.prototype.updateXXCardStatus = function(msg, session, next){
	if (xxManager.updateRoomPlayerCardStatus({roomId: msg.roomId, userId: msg.userId, cardStatus: msg.cardStatus})){
		var uids = xxManager.getRoomUserIdByRoomId({roomId: msg.roomId});
		if (uids != null && uids.length >= 1){
			//todo: 判断是否游戏结束
			if (!xxManager.checkRoomActiveStatus({roomId: msg.roomId})){
				//todo: 结算游戏
				this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId, function(error, sid){
					if (!error){
						messageService.pushMessageToPlayer({uid: msg.userId, sid: sid}, 'onUpdateCardStatusXXGame', {code: 200, uid: msg.userId, cardStatus: msg.cardStatus});
					}
				})


			} else {
				for (var i = 0; i < uids.length; i++) {
					if (uids[i] === msg.userId){
						//next(null, {code: 200, cardStatus: msg.cardStatus});
						this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId, function(error, sid){
							if (!error){
								messageService.pushMessageToPlayer({uid: uids[i], sid: sid}, 'onUpdateCardStatusXXGame', {code: 200, uid: msg.userId, cardStatus: msg.cardStatus});
							}
						})
					}
					else {
						this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId, function(error, sid){
							if (!error){
								messageService.pushMessageToPlayer({uid: uids[i], sid: sid}, 'onUpdateCardStatusXXGame', {code: 200, uid: msg.userId, cardStatus: msg.cardStatus});
							}
						})
					}	
				}
			}
		} /*else {
			next(null, {code: 201});
			return ;
		}*/
	}/* else {
		next(null, {code: 201});
		return ;
	}*/
	return next();	
}

/*
*function: 4、更新帐户信息
*param: {roomId, userId, amount, mark}
**/
Handler.prototype.updateXXGameAccount = function(msg, session, next){
	userDao.updateUserAccount({userId: msg.userId, amount: msg.amount, mark: msg.mark}, function(error, result){
		if (!error){
			var uids = xxManager.getRoomUserIdByRoomId({roomId: msg.roomId});
			if (uids != null && uids.length >= 1){
				for (var i = 0; i < uids.length; i++) {
					if (uids[i] === msg.userId){
						//next(null, {code: 200, amount: 100});
						this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId, function(error, sid){
							if (!error){
								messageService.pushMessageToPlayer({uid: uids[i], sid: sid}, 'onUpdateCardStatusXXGame', {code: 200, uid: msg.userId, amount: 100, mark: msg.mark});
							}
						})
					}
					else {
						this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId, function(error, sid){
							if (!error){
								messageService.pushMessageToPlayer({uid: uids[i], sid: sid}, 'onUpdateCardStatusXXGame', {code: 200, uid: msg.userId, amount: 100, mark: msg.mark});
							}
						})
					}
				}
			}
		} else {
			//todo， 更新失败
			this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId, function(error, sid){
				if (!error){
					messageService.pushMessageToPlayer({uid: msg.userId, sid: sid}, 'onErrorXXGame', {code: 202});
				}
			})
		}
	})
	next();
}

/*
*function: 5、比较大小
*param: {roomId, ownId, otherId, initiative}
**/
Handler.prototype.compareXXCardSize = function(msg, session, next){
	var ret = xxManager.getCompareCardSize({roomId: msg.roomId, ownId: msg.userId, otherId: msg.userId2, initiative: msg.initiative}})
	if (ret === message.XXConstant.WIN){
		this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId, function(error, sid){
			if (!error){
				messageService.pushMessageToPlayer({uid: msg.userId, sid}, 'onCompareCardXXGame', {code: 200, status: false});
			}
		});

		this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId2, function(error, sid){
			if (!error){
				messageService.pushMessageToPlayer({uid: msg.userId2, sid: sid}, 'onCompareCardXXGame', {code: 200, status: false});
			}
		});
		
		//todo: 判断是否结算游戏
		if (!xxManager.checkRoomActiveStatus({roomId: msg.roomId})){
			
		}
	}
	else if (ret === message.XXConstant.LOSE){
		this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId, function(error, sid){
			if (!error){
				messageService.pushMessageToPlayer({uid: msg.userId, sid: sid}, 'onCompareCardXXGame', {code: 200, status: true});
			}
		});

		this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId2, function(error, sid){
			if (!error){
				messageService.pushMessageToPlayer({uid: msg.userId2, sid: sid}, 'onCompareCardXXGame', {code: 200, status: true});
			}
		});

		//todo: 判断是否结算
		if (!xxManager.checkRoomActiveStatus({roomId: msg.roomId}){

		})
	}
	else {
		this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId, function(error, sid){
			if (!error){
				messageService.pushMessageToPlayer({uid: msg.userId, sid: sid}, 'onErrorXXGame', {code: 202});
			}
		})
	}
	
	next();
}

/*
*function: 结算
*param: {roomId, userId}
**/
Handler.prototype.clearingXXRoomGame = function(msg, session, next){
	if (xxManager.checkRoomActiveStatus({roomId: msg.roomId})){
		//异常数据
		/*this.app.rpc.chat.chatRemote.getPlayerSid(msg.userId, function(error, sid){
			if (!error){
				messageService.pushMessageToPlayer({uid: msg.userId, sid: sid}, 'onErrorXXGame', {code: 202});
			}
		})*/
		//next(null, {code: 202});
		return next();
	}
	var winnerId = xxManager.queryRoomWinner({roomId: msg.roomId});
	var betFund = xxManager.getXXRoomFund({roomId: msg.roomId});
	var uids = xxManager.getRoomUserIdByRoomId({roomId: msg.roomId});
	userDao.updateUserAccount({userId: winnerId, amount: fund}, function(error, res){
		if (!error){
			for (var i = 0; i < uids.length; i++) {
				if (uids[i] !== winnerId){
					this.app.rpc.chat.chatRemote.getPlayerSid(uids[i], function(error, sid){
						if (!error){
							messageService.pushMessageToPlayer({uid: uids[i], sid: sid}, 'onClearingXXGame', {code: 200, status: true, amount: 0});
						}
					})
				}
				else {
					this.app.rpc.chat.chatRemote.getPlayerSid(uids[i], function(error, sid){
						if (!error){
							messageService.pushMessageToPlayer({uid: uids[i], sid: sid}, 'onClearingXXGame', {code: 200, status: false, amount: 0});
						}
					})
				}
			}

			//初始化游戏
			if (!xxManager.initXXRoomGame(msg.roomId)){
				//不满足条件，通知等待
				var uids = xxManager.getRoomUserIdByRoomId({roomId: msg.roomId});
				this.app.rpc.chat.chatRemote.getPlayerSid(uids[0], function(error, sid){
					if (!error){
						messageService.pushMessageToPlayer({uid: uids[0], sid: sid}, 'onWaitStartXXGame', {code: 200, status: false, amount: 0});
					}
				})
			}
			else {
				//开始游戏
				this.startXXGame({roomId: msg.roomId});
			}

			return next();
		}
		else {
			//todo: 提示错误，退出房间
			next(null, {code: 201});
			return ;
		}
	})
}

/*
*function: 用户离开房间
*param: {roomId, userId}
**/

Handler.prototype.userLeaveXXRoom = function(msg, session, next){
	var uids = xxManager.getRoomUserIdByRoomId({roomId: msg.roomId});
	if (uids.length === 1){
		if (uids[0] !== msg.userId){
			//todo: 打印错误
			
		}
		//删除房间removeUserXXGameRoom
		var res = xxManager.deleteXXGameRoom({roomId: msg.roomId});
		//todo: 打印消息

	}
	else {
		//移除玩家信息
		var res = xxManager.deleteUserXXGameRoom({roomId: msg.roomId, userId: msg.userId});
		if (res !== null){
			//通知其他队员
			for (var i = 0; i < uids.length; i++) {
				if (uids[i] !== msg.userId){
					this.app.rpc.chat.chatRemote.getPlayerSid(uids[0], function(error, sid){
						if (!error){
							messageService.pushMessageToPlayer({uid: uids[0], sid: sid}, 'onDeleteUserXXGame', {code: 200, status: false, amount: 0});
						}
					})
				}				
			}
		}
		//todo: 打印消息
	}
	return next();
}

/*
*function: 请求孤注一掷
*param: {roomId, userId}
**/
Handler.prototype.guzhuyizhiRequest = function(meg, session, next){
	var uids = xxManager.getRoomUserIdByRoomId({roomId: msg.roomId});
	for (var i = 0; i < uids.length; i++) {
		this.app.rpc.chat.chatRemote.getPlayerSid(uids[0], function(error, sid){
			if (!error){
				messageService.pushMessageToPlayer({uid: uids[0], sid: sid}, 'onCompareCardXXGame', {code: 200, status: false, amount: 0});
			}
		})
	}

	return next();
}
/*
*function: 孤注一掷结果
*param: 
**/
Handler.prototype.guzhuyizhiResult = function(msg, session, next){
	var uids = xxManager.getRoomUserIdByRoomId({roomId: msg.roomId});
	for (var i = 0; i < uids.length; i++) {
		this.app.rpc.chat.chatRemote.getPlayerSid(uids[0], function(error, sid){
			if (!error){
				messageService.pushMessageToPlayer({uid: uids[0], sid: sid}, 'onGuzhuyizhiXXGame', {code: 200, status: false, amount: 0});
			}
		})
	}

	var res = xxManager.getGuzhuyizhiResult({roomId: msg.roomId, userId: msg.userId, initiative: msg.initiative});
	if (res === message.XXConstant.WIN){
		//todo: 结算游戏
		this.clearingXXRoomGame({roomId: msg.roomId, userId: msg.userId}, session, next);
	}
	else {
		//房间是否活跃
		if (xxManager.checkRoomActiveStatus({roomId: msg.roomId})){
			//todo: 通知
			//var uids = xxManager.getRoomUserIdByRoomId({roomId: msg.roomId});
			for (var i = 0; i < uids.length; i++) {
				this.app.rpc.chat.chatRemote.getPlayerSid(uids[0], function(error, sid){
					if (!error){
						messageService.pushMessageToPlayer({uid: uids[0], sid: sid}, 'onCompareCardXXGame', {code: 200, status: false, amount: 0});
					}
				})
			};
		}
		else {
			//todo: 结算游戏
			this.clearingXXRoomGame({roomId: msg.roomId, userId: msg.userId}, session, next);
		}
	}
}

function DoSendMessage(uids, functionName, param){
	for (var i = 0; i < uids.length; i++) {
		this.app.rpc.chat.chatRemote.getPlayerSid(uids[0], function(error, sid){
			if (!error){
				messageService.pushMessageToPlayer({uid: uids[0], sid: sid}, functionName.toString(), param);
			}
		})
	};
}
