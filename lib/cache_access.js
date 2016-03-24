'use strict';

var utils = require('./utils');
var _ = utils._;
var Promise = utils.Promise;
var cache = require('memory-cache');
var util = require('util');
var AccessService = require('./access');


function cacheGet(self, name, params, options, defaults) {
	var key = name + '-' + JSON.stringify(params);
		var cacheResult = cache.get(key);

	if (cacheResult) {
		return Promise.resolve(cacheResult);
	}

	options = _.defaults(options || {}, defaults);

	return AccessService.prototype[name].call(self, params).then(function(result) {
		if (result && options.cache > 0) {
			cache.put(key, result, options.cache * 1000);
		}
		return result;
	});
}

var Service = module.exports = function Service() {
	AccessService.apply(this, arguments);
};

util.inherits(Service, AccessService);

Service.prototype.trendTopics = function(params, options) {

	var defaults = {
		cache: 60 * 10
	};

	return cacheGet(this, 'trendTopics', params, options, defaults);
};

Service.prototype.stories = function(params, options) {

	var defaults = {
		cache: 60
	};

	return cacheGet(this, 'stories', params, options, defaults);
};
