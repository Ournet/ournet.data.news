'use strict';

var AccessService = require('./access');
var CacheAccessService = require('./cache_access');
var ControlService = require('./control');
var Search = require('./search');
var db = require('./db');
var utils = require('./utils');
var mongoose = require('mongoose');

var cache = {};

var external = module.exports = {
	AccessService: AccessService,
	CacheAccessService: CacheAccessService,
	ControlService: ControlService,
	Db: db,
	db: db,
	Search: Search,
	connect: function(connectionString, options, cb) {
		return mongoose.createConnection(connectionString, options, cb);
	},
	mongoose: mongoose,
	getAccessService: function(connectionString) {
		connectionString = connectionString || process.env.WEBDATA_CONNECTION;
		var key = 'access-' + connectionString;
		if (cache[key]) {
			return cache[key];
		}
		db = external.getDb(connectionString);

		cache[key] = new AccessService(db);

		return cache[key];
	},
	getCacheAccessService: function(connectionString) {
		connectionString = connectionString || process.env.WEBDATA_CONNECTION;
		var key = 'cache-access-' + connectionString;
		if (cache[key]) {
			return cache[key];
		}
		db = external.getDb(connectionString);

		cache[key] = new CacheAccessService(db);

		return cache[key];
	},
	getControlService: function(connectionString) {
		connectionString = connectionString || process.env.WEBDATA_CONNECTION;
		var key = 'control-' + connectionString;
		if (cache[key]) {
			return cache[key];
		}
		db = external.getDb(connectionString);

		cache[key] = new ControlService(db);

		return cache[key];
	},
	getSearchService: function() {
		return Search;
	},
	getDb: function(connectionString) {
		connectionString = connectionString || process.env.WEBDATA_CONNECTION;
		var key = 'db-' + connectionString;
		if (cache[key]) {
			return cache[key];
		}

		cache[key] = external.db(external.connect(connectionString));

		return cache[key];
	},
	clear: function() {
		cache = {};
	},
	createWebPageId: utils.createWebPageId,
	createImageId: utils.createImageId,
	createWebPageUniqueName: utils.formatWebPageUniqueName
};
