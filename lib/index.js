'use strict';

var AccessService = require('./access');
var ControlService = require('./control');
var Search = require('./search');
var db = require('./db');
var mongoose = require('mongoose');
var dataModel = require('./db/model');

var cache = {};

function connect(connectionString, options) {
	return mongoose.createConnection(connectionString, options);
}

function getDb(connectionString) {
	connectionString = connectionString || process.env.NEWS_CONNECTION;
	var key = 'db-' + connectionString;
	if (cache[key]) {
		return cache[key];
	}

	cache[key] = db(connect(connectionString));

	return cache[key];
}

module.exports = exports = {
	AccessService: AccessService,
	ControlService: ControlService,
	db: db,
	Search: Search,
	connect: connect,
	mongoose: mongoose,
	getAccessService: function(connectionString) {
		connectionString = connectionString || process.env.NEWS_CONNECTION;
		var key = 'access-' + connectionString;
		if (cache[key]) {
			return cache[key];
		}
		db = getDb(connectionString);

		cache[key] = new AccessService(db);

		return cache[key];
	},
	getControlService: function(connectionString) {
		connectionString = connectionString || process.env.NEWS_CONNECTION;
		var key = 'control-' + connectionString;
		if (cache[key]) {
			return cache[key];
		}
		db = getDb(connectionString);

		cache[key] = new ControlService(db);

		return cache[key];
	},
	getSearchService: function() {
		return Search;
	},
	getDb: getDb,
	clear: function() {
		cache = {};
	},
	createWebPageId: dataModel.createWebPageId,
	createImageId: dataModel.createImageId,
	createWebPageUniqueName: dataModel.formatWebPageUniqueName
};
