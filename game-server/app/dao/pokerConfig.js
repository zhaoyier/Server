var async = require('async');
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../util/utils');
var consts = require('../consts/consts');

var pokerData = module.exports;

/*
 * *export poker config data into memery
 * * @param {String} username
 * * @param {String} password
 * * @param {String} callback
 * */

pokerData.selectPokerData = function(callback){
	var sql = 'select id, color, byte, describe';
	pomelo.app.get('dbclient').query(sql, [], function(error, values){
		if (error != null){
			utils.invokeCallback(callback, error, {code: consts.ERROR.SQL_ERROR});
		}
		else {
			if (!!values && values.length === 54){
				utils.invokeCallback(callback, null, {code: consts.OK, data: values});
			}
			else {
				utils.invokeCallback(callback, null, {code: consts.ERROR.POKER.CONFIG_ERROR})
			}
		}
	})
}
