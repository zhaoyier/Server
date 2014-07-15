var async = require('async');
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../util/utils');
var consts = require('../consts/consts');
var User = require('../domain/user');

var userDao = module.exports;

/**
 * check username and password
 * @param {String} username
 * @param {String} password
 * @param {String} callback
 * */
userDao.getUserLogin = function (username, password, callback){
	var sql = 'select * from User where username = ? and password = ?';
	var args = [username, password];
	pomelo.app.get('dbclient').query(sql, args, function(error, result){
		if (error != null){
			utils.invokeCallback(callback, error.message, {});
		} else {
			if (!!result && result.length === 1){
				utils.invokeCallback(callback, null, {wuid: result[0].wuid});
			}
			else {
				utils.invokeCallback(callback, error.message, {});
			}
		}
	})
}

userDao.checkUsernameAndPassword = function(username, password, callback){
	var sql = 'select * from User where username = ? and password = ?';
	var args = [username, password];
	pomelo.app.get('dbclient').query(sql, args, function(error, res){
		if (error != null){
			utils.invokeCallback(callback, error.message, null);
		} else {
			if (!!res && res.length === 1){
				utils.invokeCallback(callback, null, new User(res[0]));
			}
			else {
				utils.invokeCallback(callback, error.message, null);
			}
		}
	})
}

userDao.getPlayersByUid = function(uid, cb){
	var sql = 'select * from playerInfo where userId = ?';
	var args = [uid];

	pomelo.app.get('dbclient').query(sql, args, function(error, res){
		if (error){
			utils.invokeCallback(cb, error.message, null);
			return ;
		}

		if (!res || res.length <= 0){
			utils.invokeCallback(cb, null, []);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	})
}

userDao.setRegistUser = function(username, password, callback){
	var sql = 'select * from User where username = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql, args, function(error, result){
		if (error != null){
			utils.invokeCallback(callback, error.message, {});
		} 
		else {
			if (!!result && result.length >= 1){
				utils.invokeCallback(callback, error.message, {});
			}
			else {
				//sql = 'insert into User set username = ?, password = ?';
				sql = 'insert into User(username, password) values(?,?)';
				args = [username, password];
				pomelo.app.get('dbclient').query(sql, args, function(error, result){
					if (error != null){
						utils.invokeCallback(callback, error.message, {});
					}
					else {
						utils.invokeCallback(callback, null, {wuid:result['insertId']});
					}
				})
			} 
		}
	})
}

userDao.queryUserAccountInfo = function(userId, callback){
	var sql = 'select uid, diamond, goldcoin from account_info where uid = ?';
	var args = [parseInt(userId)||0];

	pomelo.app.get('dbclient').query(sql, args, function(error, result){
		if (error != null){
			utils.invokeCallback(callback, consts.ERROR.SQL_ERROR, {});
		}
		else {
			if (!!result && result.length === 1){
				utils.invokeCallback(callback, null, {account: result[0] });
			}
			else {
				utils.invokeCallback(callback, 201, {});
			}
		}
	})
}

/*
*function: 
*paraments: data: {userId, amount, mark}
**/
userDao.updateUserAccount = function(data, callback){
	if (data.userId === undefined || data.amount === undefined || isNaN(data.amount)){
		return utils.invokeCallback(callback, null, {code: 201});
	}

	var sql = 'update account_info set goldCoin = ? where uid = ?';
	var args = [data.amount, data.uid];
	pomelo.app.get('dbclient').query(sql, args, function(error, res){
		if (!error){
			return this.queryUserAccountInfo(data.userId, callback);
		}
		else {
			return utils.invokeCallback(callback, 201, {});
		}
	})
}

/*
*function: 用户充值
*param: {userId, amount, transId}
**/

userDao.onUserRecharge = function(data, callback){
	if (isNaN(data.userId) || isNaN(data.amount) || (data.type != 0 && data.type != 1)){
		return utils.invokeCallback(callback, 201, {});
	}
	else {
		var sql = 'insert into recharge_history(uid, amount, transId) values(?, ?, ?)';
		var args = [data.userId, data.amount, data.transId];
		pomelo.app.get('dbclient').query(sql, args, function(error, res){
			if (!error){
				sql = 'update account_info set diamond = ? where uid = ?';
				args = [data.amount, data.userId];
				pomelo.app.get('dbclient').query(sql, args, function(error, res){
					if (!error){
						return utils.invokeCallback(callback, null, {diamond: 10});
					}
				})
			}
			return utils.invokeCallback(callback, 201, {});			
		})
	}
}

/**
 * todo: 
 * get user infomation by userId
 * @param {String} uid UserId
 * @param {function} cb Callback function
 */
userDao.getUserById = function (uid, cb){
	var sql = 'select * from	User where id = ?';
	var args = [uid];
	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb,err.message, null);
			return;
		}

		if (!!res && res.length > 0) {
			utils.invokeCallback(cb, null, new User(res[0]));
		} else {
			utils.invokeCallback(cb, ' user not exist ', null);
		}
	});
};











