var async = require('async');
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../util/utils');
var consts = require('../consts/consts');

var gameDao = module.exports;

gameDao.queryGameMenu = function (callback) {
	var sql = 'select gameId, mainOption, subOption, path, describe from game_option';
	pomelo.app.get('dbclient').query(sql, [], function(error, result){
		if (error != null){
			utils.invokeCallback(callback, 201, {});
		} else {
			utils.invokeCallback(callback, null, {gameMenu: result});
		}
	})
}
