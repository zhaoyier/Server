var pomelo = require('pomelo');
var sync = require('pomelo-sync-plugin');

var dispatcher = require('./app/util/dispatcher');
var ChatService = require('./app/services/chatService');
/**
 * Init app for client.
 */

/*var fireRoute = function(session, msg, app, cb) {
  var fireServers = app.getServersByType('fire');

    if(!fireServers || fireServers.length === 0) {
        cb(new Error('can not find fire servers.'));
        return;
    }
  
    var res = dispatcher.dispatch(session.get('rid'), fireServers);

    cb(null, res.id);
};*/

var app = pomelo.createApp();
app.set('name', 'xman');

// app configuration
app.configure('production|development', function() {
  app.set('remoteConfig', {
    cacheMsg: true,
    interval: 30
  })

	//app.route('fire', fireRoute);
	app.loadConfig('mysql', app.getBase()+'/../shared/config/mysql.json');
	app.filter(pomelo.filters.timeout());	
});


app.configure('production|development', 'gate|fire|connector|master', function(){
	var dbclient = require('./app/dao/mysql/mysql').init(app);
	app.set('dbclient', dbclient);
	app.use(sync, {sync: {path:__dirname+'/app/dao/mapping', dbclient: dbclient}});
})

app.configure('production|development', 'connector', function(){
    var dictionary = app.components['__dictionary__'];
    var dict = null;
    if(!!dictionary){
      dict = dictionary.getDict();
    }
    
  	app.set('connectorConfig',
    {
		  connector : pomelo.connectors.hybridconnector,
     	heartbeat : 3,
     	useDict : true,
     	useProtobuf : true,
  		handshake : function(msg, cb){
        cb(null, {});
      }
    });
});

app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
	{
		connector : pomelo.connectors.hybridconnector,
		//heartbeat : 3,
		//useDict : true,
		useProtobuf : true
	});
});

// Configure for chat server
app.configure('production|development', 'chat', function() {
  app.set('chatService', new ChatService(app));
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
