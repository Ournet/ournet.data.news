'use strict';

var core = require('ournet.core');
var Promise = core.Promise;
var _ = core._;
var internal = {};
var utils = require('./utils');
var Search = require('./search');
internal.get = utils.mongoGet;

var Service = module.exports = function(db) {
	this.db = db;
};

/**
 * Create a webpage
 */
Service.prototype.createWebPage = function(data) {
	data = utils.normalizeWebPage(data);
	var model = utils.formatWebSitesTableName(data);
	return this.db[model].createAsync(data).then(function(item) {
		item = internal.get(item);
		return Search.createWebPage(item)
			.catch(function() {
				// console.log('Search.createWebPage error', error);
				return item;
			})
			.then(function() {
				return item;
			});
	});
};

/**
 * Create a story
 */
Service.prototype.createStory = function(data) {
	data = utils.normalizeStory(data);
	var model = utils.formatStoriesTableName(data);
	return this.db[model].createAsync(data).then(internal.get);
};

/**
 * Create a quote
 */
Service.prototype.createQuote = function(data) {
	data = utils.normalizeQuote(data);
	return this.db.Quote.createAsync(data).then(internal.get);
};

/**
 * Create a image
 */
Service.prototype.createImage = function(data) {
	data = utils.normalizeImage(data);
	return this.db.Image.createAsync(data).then(internal.get);
};

Service.prototype.addWebsiteToImage = function(imageId, websiteId) {
	return this.db.Image.findByIdAndUpdateAsync(imageId, {
		$push: {
			websites: websiteId
		},
		updatedAt: Date.now()
	}, {
		safe: true,
		upsert: true
	}).then(internal.get);
};


Service.prototype.setTopicTrend = function(options, topic, counts) {
	var self = this;
	topic = _.pick(topic, 'id', 'name', 'uniqueName', 'category', 'type', 'abbr', 'key', 'country', 'lang');
	topic.country = topic.country || options.country;
	topic.lang = topic.lang || options.lang || options.language;
	topic._id = topic.id;
	topic.counts = {
		count24h: counts.count24h,
		countPrev24h: counts.countPrev24h
	};
	topic.counts.trend24h = topic.counts.count24h - topic.counts.countPrev24h;

	return self.db.TopicTrend.findOneAsync({
			_id: topic.id
		})
		.then(function(trend) {
			if (!trend) {
				return self.db.TopicTrend.createAsync(topic);
			}
			Promise.promisifyAll(trend);
			trend.name = topic.name;
			trend.abbr = topic.abbr;
			trend.uniqueName = topic.uniqueName;
			trend.key = topic.key;
			trend.counts = topic.counts;
			trend.country = topic.country;
			trend.lang = topic.lang;
			return trend.saveAsync();
		}).then(function() {});
};
