var async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../../util/utils');
var userDao = require('../../../dao/userDao');
var consts = require('../../../consts/consts');
var Code = require('../../../../../shared/code');
var dispatcher = require('../../../util/dispatcher');
var channelUtil = require('../../../util/channelUtil');

module.exports = function(app){
	return new Handler(app);
};

var Handler = function(app){
	this.app = app;
	if (!this.app){
		logger.error(app);
	}
}

Handler.prototype.entry = function(msg, session, next){
	var token = msg.token, self = this;
	token = "todo";

	if (!token){
		return next(new Error('invalid entry request: empty token'), {code: 0});
	}

	var uid, players, player;
	async.waterfall([
		function(cb){
			self.app.rpc.auth.authRemote.auth(session, msg, cb);
		}, function(code, user, cb){
			if (code !== Code.OK){
				next(null, {code: code});
				return;
			}

			if (!user){
				next(null, {code: Code.ENTRY.FA_USER_NOT_EXIST});
			}

			uid = user.id;
			userDao.getPlayersByUid(user.id, cb);
		}, function(res, cb){
			players = res;
			self.app.get('sessionService').kick(uid, cb);
		}, function(cb){
			if (!players || players.length === 0){
				next(null, {code: Code.ok});
				return ;
			}

			player = players[0];
			//session.set('serverId', self.app.get('areaIdMap')[player.areaId]);
			session.set('playername', player.name);
			session.set('userId', player.id);
			session.on('closed', onUserLeave.bind(null, self.app));
			session.pushAll(cb);
		}, function(cb){
			self.app.rpc.chat.chatRemote.add(session, player.userId, player.name, channelUtil.getGlobalChannelName(), cb);
		}
	], function(error){
		if (error){
			next(error, {code: Code.FAIL});
			return ;
		}

		next(null, {code: Code.OK, player: players? player[0]: null});
	})
};

Handler.prototype.register = function(msg, session, next) {
	var token = msg.token, self = this;
    token = "todo";

    if (!token){
        return next(new Error('invalid regist request: empty token'), {code:consts.TOKEN});
    }

    if (msg['password'] != msg['repassword']){
        return next(consts.ERROR.ACCOUNT.PASSWORD_INEQUALITY, {});
    }   
    
    userDao.setRegistUser(msg['username'], msg['password'], function(error, result){
        if (!error && result){
            return next(null, {code: consts.OK, wuid: result['wuid']});
        }
        else {
    		return next(error, {});
        }   
    }) 
};

var onUserLeave = function(app, session){
	if (!session || session.uid){
		return;
	}

	utils.myPrint('1 ~ onUserLeave is running ...');
	/*app.rpc.area.playerRemote.playerLeave(session, {userId: session.get('userId'), instanceId: session.get('instanceId')}, function(error){
		if (!!error){
			logger.error('user leave error! %j', error);
		}
	})*/

	app.rpc.chat.chatRemote.kick(session, session.uid, null);
};
