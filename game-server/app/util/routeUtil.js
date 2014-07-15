var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.login = function(session, msg, app, cb){
	var loginServers = app.getServersByType('fire');
	
	if (!loginServers || chatServers.length === 0){
		cb(new Error('can not find login servers.'));
		return;
	}

	var res = dispatcher.dispatch(session.get('rid'), loginServers);
	
	cb(null, res.id);
}

exp.area = function(session, msg, app, cb) {
    var serverId = session.get('serverId');

    if(!serverId) {
        cb(new Error('can not find server info for type: ' + msg.serverType));
        return;
    }   

    cb(null, serverId);
};

exp.connector = function(session, msg, app, cb) {
    if(!session) {
        cb(new Error('fail to route to connector server for session is empty'));
        return;
    }   

    if(!session.frontendId) {
        cb(new Error('fail to find frontend id in session'));
        return;
    }   

    cb(null, session.frontendId);
};