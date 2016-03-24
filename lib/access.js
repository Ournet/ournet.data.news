'use strict';

var assert = require('assert');
var utils = require('./utils');
var get = utils.data.mongoGet;
var Promise = utils.Promise;
var _ = utils._;

var Service = module.exports = function Service(db) {
	this.db = db;
};

Service.prototype.trendTopics = function(params) {
	assert.ok(params);
	return this.list('TopicTrend', params);
};

Service.prototype.quotes = function(params) {
	assert.ok(params);

	return this.list('Quote', params);
};

Service.prototype.webpages = function(params) {
	assert.ok(params);
	assert.ok(params.culture);
	var model = utils.formatWebPagesTableName(params.culture);

	return this.list(model, params);
};

Service.prototype.countWebpages = function(params) {
	assert.ok(params);
	assert.ok(params.culture);
	var model = utils.formatWebPagesTableName(params.culture);

	return this.count(model, params);
};

Service.prototype.webpage = function(params) {
	assert.ok(params);
	assert.ok(params.culture);

	var model = utils.formatWebPagesTableName(params.culture);
	return this.one(model, params);
};

Service.prototype.stories = function(params) {
	assert.ok(params);
	assert.ok(params.culture);
	var model = utils.formatStoriesTableName(params.culture);

	return this.list(model, params);
};

Service.prototype.countStories = function(params) {
	assert.ok(params);
	assert.ok(params.culture);
	var model = utils.formatStoriesTableName(params.culture);

	return this.count(model, params);
};

Service.prototype.image = function(params) {
	assert.ok(params);
	if (_.isString(params)) {
		params = {
			where: {
				_id: params
			}
		};
	} else if (!params.where) {
		params = {
			where: params
		};
	}

	return this.one('Image', params);
};

Service.prototype.one = function(model, params) {
	return this.db[model].findOneAsync(params.where, params.select).then(get);
};

Service.prototype.count = function(model, params) {
	return this.db[model].countAsync(params.where);
};

Service.prototype.list = function(model, params) {
	var self = this,
		limit = 10;
	params = _.pick(params, 'where', 'limit', 'order', 'select', 'offset');
	if (params.limit && (params.limit < 1 || params.limit > 200)) {
		delete params.limit;
	}

	//console.log('splited select: ', params.select);
	//params.order = params.order || ;
	var sort = [];
	if (_.isString(params.order)) {
		params.order.split(/[ ,;]+/g).forEach(function(name) {
			if (name.length < 2) {
				return;
			}
			if (name[0] === '-') {
				sort.push([name.substr(1), -1]);
			} else {
				sort.push([name, 1]);
			}
		});
	}

	//console.log('accessing', model, params.where, params.limit, params.offset);

	return new Promise(function(resolve, reject) {
		//console.log('in Promise!: ', model);
		self.db[model]
			.find(params.where)
			.select(params.select)
			.sort(sort)
			.skip(params.offset || 0)
			.limit(params.limit || limit)
			.exec(function(error, list) {
				if (error) {
					//console.log(error);
					return reject(error);
				}
				list = get(list);
				resolve(list);
			});
	});
};
