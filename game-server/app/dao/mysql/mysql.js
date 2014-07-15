//mysql CRUD
var sqlclient = module.exports;

var _pool;

var NND = {};

NND.init = function(app){
	_pool = require('./dao-pool').createMysqlPool(app);
};

NND.query = function(sql, args, callback){
	_pool.acquire(function(error, client){
		if (!!error){
			console.log('[sqlqueryError]'+err.stack);
			return ;
		}
		client.query(sql, args, function(error, result){
			_pool.release(client);
			callback(error, result);
		});
	});
};

NND.shutdown = function(app){
	_pool.destroyAllNow();
};

sqlclient.init = function(app){
	if (!!_pool){
		return sqlclient;
	}else {
		NND.init(app);
		sqlclient.insert = NND.query;
		sqlclient.update = NND.query;
		sqlclient.delete = NND.query;
		sqlclient.query = NND.query;
		return sqlclient;
	}
};

sqlclient.shutdown = function(app){
	NND.shutdown(app);
}
