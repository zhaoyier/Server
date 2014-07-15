var crc = require('crc');

module.exports.dispatch = function(uid, connectors){
	var index = Math.abs(parseInt(crc.crc32(uid).toString(), 16)) % connectors.length;
	return connectors[index];
};

