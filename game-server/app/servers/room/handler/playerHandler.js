var userDao = require('../../../dao/userDao');

module.exports = function(app){
	return new Handler(app);
};

var Handler = function(app){
	this.app = app;
	if (!this.app){
		//logger.error(app);
	}
}

Handler.prototype.getUserAccountInfo = function(msg, session, next){
	userDao.queryUserAccount(msg.userId, function(error, res){
		if (!error){
			gameDao.queryGameMenu(function(error, res){
				
			}
			next(null, {code: 200});
		}
		else {
			next(null, {code: 201});
		}
	})
}

Handler.prototype.getGameMenuInfo = function(msg, session, next){
	gameDao.queryGameMenu(function(error, res){
		if (!error){
			next(null, {code: 200})
		}
		else {
			next(null, {code; 201})
		}
	})
}

Handler.prototype.userRecharge = function(msg, session, next){
	userDao.onUserRecharge({{userId: msg.userId, amount: msg.amount, transId: msg.transId}}, function(error, res){
		if (!error){
			next(null, {code: 200});
		}
		else {
			next(null, {code: 201});
		}
	})
}

Handler.prototype.leaveGame = function(msg, session, next){

}
