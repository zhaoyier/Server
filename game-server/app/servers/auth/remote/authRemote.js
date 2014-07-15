//var tokenService = require('../../../../../shared/token');
var userDao = require('../../../dao/userDao');
var Code = require('../../../../../shared/code');

var DEFAULT_SECRET = 'pomelo_session_secret';
var DEFAULT_EXPIRE = 6 * 60 * 60 * 1000;	// default session expire time: 6 hours

module.exports = function(app) {
	return new Remote(app);
};

var Remote = function(app) {
	this.app = app;
	var session = app.get('session') || {};
	this.secret = session.secret || DEFAULT_SECRET;
	this.expire = session.expire || DEFAULT_EXPIRE;
};

pro.auth = function(args, cb){
	if (!checkExpire(args, this.expire)){
		return cb(null, Code.ENTRY.FA_TOKEN_EXPIRE);
	}

	userDao.checkUsernameAndPassword(args.username, args.password, function(error, user){
		if (error){
			return cb(error, Code.FAIL, {});
		}

		cb(null, Code.OK, user);
	})
}

/**
 * Check the token whether expire.
 *
 * @param  {Object} token  token info
 * @param  {Number} expire expire time
 * @return {Boolean}        true for not expire and false for expire
 */
var checkExpire = function(token, expire) {
	if(expire < 0) {
		// negative expire means never expire
		return true;
	}

	return (Date.now() - token.timestamp) < expire;
};