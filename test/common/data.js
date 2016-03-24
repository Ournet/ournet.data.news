'use strict';

if (!process.env.AWS_REGION) {
	console.log('no AWS_REGION');
	module.exports = false;
	return;
}

var Data = require('../../lib');

exports.access = Data.getAccessService();
exports.control = Data.getControlService();
