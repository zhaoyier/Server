var async = require('async');
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../util/utils');

var cardInfo = module.exports;

/**
 * check username and password
 * @param {String} username
 * @param {String} password
 * @param {String} callback
 * */
cardInfo.getCardInfo = function (callback){
	var sql = 'select * from CardInfo';
	pomelo.app.get('dbclient').query(sql, [], function(error, values){
		if (error != null){
			utils.invokeCallback(callback, error, null);
		} else {
			if (!!values){
				var cardArray = new Array();
				for (var key in values){
					cardArray.push({id: values[key]['id'], color: values[key]['color'], value: values[key]['value'], description: values[key]['description']});
				}
				console.log("-----------------------\t", typeof(cardArray));
				utils.invokeCallback(callback, null, {cards: cardArray});
			}
			else {
				utils.invokeCallback(callback, null, {cards: []});
			}
		}
	})
}
