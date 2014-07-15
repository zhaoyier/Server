var randomString = require('random-string');
var dispatcher = require('../../../util/dispatcher');

module.exports = function(app){
	return new Handler(app);
}

var Handler = function(app){
	this.app = app;
}

Handler.prototype.queryEntry = function(msg, session, next) {
	var username = msg.username;
	if (!username){
		next(null, {code: 0});
	}
	else {
		var connectors = this.app.getServersByType('connector');
		if (!connectors || connectors.length === 0){
			next (null, {code: 0});
			return ;
		}
		else {
			var token = randomString({length: 20});
			//var ip = session.__session__.__socket__.remoteAddress.ip;
			//session.set('uid', uid);
			//session.set('token', token);
			var result = dispatcher.dispatch(username, connectors);
			next(null, {code: 200, host: result.host, port: result.clientPort, token: token});
		}
	}
};


